import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/mysql.js';

export const index = async (req, res) => {
    try {
        const [bots] = await db.query(`
            SELECT b.*, (SELECT COUNT(*) FROM bot_groups WHERE session_id = b.session_id) as group_count 
            FROM bots b 
            ORDER BY created_at DESC
        `);
        res.render('index', { title: 'Dashboard', bots });
    } catch (error) {
        console.error(error);
        res.render('index', { title: 'Dashboard', bots: [] });
    }
};

export const create = (req, res) => {
    res.render('add', { title: 'Add New Bot' });
};

export const store = async (req, res) => {

    try {
        const sessionId = uuidv4(); 
        const botManager = req.app.get('botManager');
        
        // Save to DB first
        await db.query('INSERT INTO bots (session_id, status) VALUES (?, ?)', [sessionId, 'scanning']);

        // Start the bot process
        botManager.createBot(sessionId);

        res.render('scan', { title: 'Scan QR', sessionId });
    } catch (error) {
         console.error(error);
         res.status(500).send('Error creating bot');
    }
};

export const show = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const [bots] = await db.query('SELECT * FROM bots WHERE session_id = ?', [sessionId]);
        if (bots.length === 0) return res.status(404).send('Bot not found');
        
        const [groups] = await db.query('SELECT * FROM bot_groups WHERE session_id = ? ORDER BY created_at DESC', [sessionId]);
        
        res.render('detail', { title: 'Bot Details', bot: bots[0], groups });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching bot details');
    }
};


export const joinGroup = async (req, res) => {
    const { sessionId, groupLink } = req.body;
    
    if(!sessionId || !groupLink) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    try {
        const botManager = req.app.get('botManager');
        const { group_id, group_name } = await botManager.joinGroup(sessionId, groupLink);
        
        console.log(`Saving group info to DB: ${group_name} (${group_id})`);

        // Insert into bot_groups table instead of overwriting bots table
        await db.query('INSERT INTO bot_groups (session_id, group_id, group_name, group_link) VALUES (?, ?, ?, ?)',
            [sessionId, group_id, group_name, groupLink]);
        
        // Update bot status to connected (if it was busy or something)
        await db.query('UPDATE bots SET status = ? WHERE session_id = ?', ['connected', sessionId]);
        
        res.json({ success: true, message: `Joined ${group_name} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Failed to join group' });
    }
};


export const destroy = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const botManager = req.app.get('botManager');
        await botManager.deleteBot(sessionId);
        
        // Remove from DB
        await db.query('DELETE FROM bot_groups WHERE session_id = ?', [sessionId]);
        await db.query('DELETE FROM bots WHERE session_id = ?', [sessionId]);
        
        res.json({ success: true, message: 'Bot deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete bot' });
    }
};
