import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/mysql.js';

export const index = async (req, res) => {
    try {
        const [bots] = await db.query('SELECT * FROM bots ORDER BY created_at DESC');
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

export const joinGroup = async (req, res) => {
    const { sessionId, groupLink } = req.body;
    
    if(!sessionId || !groupLink) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    try {
        const botManager = req.app.get('botManager');
        const { group_id, group_name } = await botManager.joinGroup(sessionId, groupLink);
        
        console.log(`Saving group info to DB: ${group_name} (${group_id})`);

        // We use the group_id column to store the Group Name for display purposes as per current schema
        await db.query('UPDATE bots SET group_link = ?, group_id = ?, status = ? WHERE session_id = ?', 
            [groupLink, group_name, 'busy', sessionId]);
        
        res.json({ success: true, message: 'Joined group successfully' });
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
        await db.query('DELETE FROM bots WHERE session_id = ?', [sessionId]);
        
        res.json({ success: true, message: 'Bot deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete bot' });
    }
};
