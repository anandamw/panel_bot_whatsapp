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
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        // Bind Custom Logic (Anti, Menu, Payment, etc)
        bindClientEvents(client);

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
            } catch (err) {
                console.error('Failed to update status/phone to connected', err);
            }
        });

        client.on('authenticated', () => {
             console.log(`Client ${sessionId} authenticated!`);
             this.io.emit('authenticated', { sessionId });
        });

        client.on('auth_failure', (msg) => {
            console.error(`AUTHENTICATION FAILURE for ${sessionId}`, msg);
             this.io.emit('log', { sessionId, message: 'Auth failure' });
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
        
        try {
            // Regex to extract code from links like https://chat.whatsapp.com/CODE or just CODE
            const match = groupLink.match(/(?:chat\.whatsapp\.com\/)?([0-9A-Za-z]{20,24})/);
            const code = match ? match[1] : groupLink;

            if (!code) throw new Error("Invalid Group Link Format");
            
            console.log(`Attempting to join group with code: ${code}`);
            
            // Wait 2 seconds to ensure client is fully synced
            await new Promise(resolve => setTimeout(resolve, 2000));

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
