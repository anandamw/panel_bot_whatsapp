import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { db } from '../database/mysql.js';
import { bindClientEvents } from './whatsapp/index.js';

class BotManager {
    constructor(io) {
        this.io = io;
        this.clients = new Map(); // Store client instances: sessionId -> Client
    }

    async initializeBots() {
        try {
            console.log('Restoring sessions...');
            const [bots] = await db.query('SELECT * FROM bots');
            for (const bot of bots) {
                console.log(`Restoring session: ${bot.session_id}`);
                this.createBot(bot.session_id);
            }
        } catch (error) {
            console.error('Failed to restore sessions:', error);
        }
    }

    createBot(sessionId) {
        if (this.clients.has(sessionId)) {
            console.log(`Session ${sessionId} already exists.`);
            return this.clients.get(sessionId);
        }

        console.log(`Creating new bot session: ${sessionId}`);

        const client = new Client({
            authStrategy: new LocalAuth({ clientId: sessionId }),
            puppeteer: {
                headless: 'shell', // Use 'shell' for better server compatibility or true
                protocolTimeout: 120000, // Increase protocol timeout to 2 minutes
                timeout: 60000, // Navigation timeout
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-extensions',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote'
                ],
                // Explicitly set a standard User-Agent
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            }
        });

        // Bind Custom Logic (Anti, Menu, Payment, etc)
        bindClientEvents(client, sessionId);

        client.on('qr', (qr) => {
            console.log(`QR Code received for ${sessionId}`);
            this.io.emit('qr', { sessionId, qr });
        });

        client.on('ready', async () => {
            console.log(`Client ${sessionId} is ready!`);
            this.io.emit('ready', { sessionId });
            
            try {
                const phoneNumber = client.info.wid.user;
                console.log(`Bot Phone Number: ${phoneNumber}`);
                await db.query('UPDATE bots SET status = ?, phone_number = ? WHERE session_id = ?', ['connected', phoneNumber, sessionId]);

                // =====================
                // GREETING MESSAGE - Kirim sapaan ke semua grup yang terdaftar
                // =====================
                const [groups] = await db.query('SELECT group_id, group_name FROM bot_groups WHERE session_id = ?', [sessionId]);
                
                if (groups.length > 0) {
                    console.log(`Sending greeting to ${groups.length} groups...`);
                    
                    const greetingMessage = `
✨ *Haiii~ Bot sudah online!* 💕

Halo semuanya! 👋
Bot sudah siap melayani~

Ketik *.menu* untuk melihat daftar perintah.
Selamat berbelanja! 🛒💖
                    `.trim();

                    for (const group of groups) {
                        try {
                            const chat = await client.getChatById(group.group_id);
                            if (chat) {
                                await chat.sendMessage(greetingMessage);
                                console.log(`✓ Greeting sent to: ${group.group_name}`);
                            }
                        } catch (greetErr) {
                            console.error(`Failed to send greeting to ${group.group_name}:`, greetErr.message);
                        }
                        // Small delay to avoid spam detection
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (err) {
                console.error('Failed to update status/phone to connected', err);
            }
        });

        client.on('authenticated', () => {
             console.log(`Client ${sessionId} authenticated!`);
             this.io.emit('authenticated', { sessionId });
        });

        client.on('auth_failure', async (msg) => {
            console.error(`AUTHENTICATION FAILURE for ${sessionId}`, msg);
            this.io.emit('log', { sessionId, message: 'Auth failure' });
            // Update status di database
            try {
                await db.query('UPDATE bots SET status = ? WHERE session_id = ?', ['disconnected', sessionId]);
            } catch (e) {
                console.error('Failed to update status on auth_failure:', e.message);
            }
        });

        client.on('disconnected', async (reason) => {
            console.log(`Client ${sessionId} disconnected: ${reason}`);
            this.io.emit('log', { sessionId, message: `Disconnected: ${reason}` });
            
            try {
                await db.query('UPDATE bots SET status = ? WHERE session_id = ?', ['disconnected', sessionId]);
                
                // Auto-reconnect jika masih ada di map
                if (this.clients.has(sessionId)) {
                    console.log(`Attempting to reconnect ${sessionId} in 5 seconds...`);
                    setTimeout(() => {
                        if (this.clients.has(sessionId)) {
                            this.clients.delete(sessionId);
                            this.createBot(sessionId);
                        }
                    }, 5000);
                }
            } catch (e) {
                console.error('Error handling disconnect:', e.message);
            }
        });

        client.initialize().catch(err => {
            console.error(`Initialization failed for ${sessionId}:`, err.message);
        });
        this.clients.set(sessionId, client);
        return client;
    }

    getBot(sessionId) {
        return this.clients.get(sessionId);
    }

    async joinGroup(sessionId, groupLink) {
        const client = this.clients.get(sessionId);
        if (!client) {
             throw new Error("Bot not found or not connected");
        }
        
        // Wait for client to be fully ready (has info) with retries
        let clientReadyRetries = 20; // Max 20 retries = ~60 seconds
        while ((!client.info || !client.info.wid) && clientReadyRetries > 0) {
            console.log(`Waiting for client to be ready... (${clientReadyRetries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            clientReadyRetries--;
        }
        
        if (!client.info || !client.info.wid) {
            throw new Error("Bot belum sepenuhnya siap setelah menunggu. Pastikan bot sudah scan QR dan status 'Connected'.");
        }
        
        try {
            // Regex to extract code from links like https://chat.whatsapp.com/CODE or just CODE
            const match = groupLink.match(/(?:chat\.whatsapp\.com\/)?([0-9A-Za-z]{20,24})/);
            const code = match ? match[1] : groupLink;

            if (!code) throw new Error("Invalid Group Link Format");
            
            console.log(`Attempting to join group with code: ${code}`);
            
            // Wait for Store to be ready with retries
            let retries = 15; // Increase retries
            let ready = false;
            while (retries > 0 && !ready) {
                // SAFETY CHECK: client.pupPage could be null if browser is not yet ready
                if (client.pupPage) {
                    try {
                        ready = await client.pupPage.evaluate(() => {
                            return typeof window.Store !== 'undefined' && 
                                   typeof window.Store.GroupInvite !== 'undefined';
                        });
                    } catch (evalErr) {
                        console.log(`Evaluate failed: ${evalErr.message}`);
                        ready = false;
                    }
                }

                if (!ready) {
                    console.log(`Store not ready or Page not initialized yet, retrying... (${retries} left)`);
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Increase delay to 3 seconds
                    retries--;
                }
            }

            if (!ready) {
                throw new Error("WhatsApp Store initialization timed out. Pastikan bot sudah dalam status 'Connected' sebelum join group.");
            }

            const groupId = await client.acceptInvite(code);
            console.log(`Joined group: ${groupId}`);
            
            // Get Group Info
            let chat = await client.getChatById(groupId);
            
            // Retry if name is missing (sometimes sync takes time)
            if (!chat || !chat.name) {
                console.log("Chat name missing, waiting 2s and retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                chat = await client.getChatById(groupId);
            }

            const groupName = chat ? (chat.name || chat.subject || 'Unknown Group') : 'Unknown Group';
            console.log(`Chat Fetched: ${groupName} | ID: ${groupId}`);
            
            return { group_id: groupId, group_name: groupName };
        } catch (error) {
            console.error("Failed to join group:", error);
            throw error;
        }
    }

    async deleteBot(sessionId) {
        try {
             if (this.clients.has(sessionId)) {
                const client = this.clients.get(sessionId);
                await client.destroy();
                this.clients.delete(sessionId);
                console.log(`Session ${sessionId} destroyed.`);
            }
            return true;
        } catch (error) {
            console.error(`Error deleting session ${sessionId}:`, error);
            throw error;
        }
    }
}

export default BotManager;
