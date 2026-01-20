import { db } from '../database/mysql.js';

export const getSetting = async (groupId) => {
  const [rows] = await db.query(
    'SELECT * FROM settings WHERE group_id = ?',
    [groupId]
  );
  
  if (rows.length > 0) return rows[0];

  // If not found, create default and return it
  const defaultSettings = {
    group_id: groupId,
    bot_open: 1,
    anti_ch: 0,
    anti_wame: 0,
    anti_link: 0,
    anti_pl: 0,
    anti_asing: 0,
    anti_bot: 0,
    anti_toxic_1: 0,
    anti_toxic_2: 0,
    anti_link_tt: 0,
    anti_link_yt: 0,
    anti_link_gc_1: 0,
    anti_link_gc_2: 0
  };

  await db.query(`
    INSERT INTO settings (
      group_id, bot_open, anti_ch, anti_wame, anti_link, anti_pl, 
      anti_asing, anti_bot, anti_toxic_1, anti_toxic_2, 
      anti_link_tt, anti_link_yt, anti_link_gc_1, anti_link_gc_2
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    defaultSettings.group_id, defaultSettings.bot_open, defaultSettings.anti_ch,
    defaultSettings.anti_wame, defaultSettings.anti_link, defaultSettings.anti_pl,
    defaultSettings.anti_asing, defaultSettings.anti_bot, defaultSettings.anti_toxic_1,
    defaultSettings.anti_toxic_2, defaultSettings.anti_link_tt, defaultSettings.anti_link_yt,
    defaultSettings.anti_link_gc_1, defaultSettings.anti_link_gc_2
  ]);

  return defaultSettings;
};

export const updateSetting = async (groupId, data) => {
  const {
    bot_open,
    anti_ch,
    anti_wame,
    anti_link,
    anti_pl,
    anti_asing,
    anti_bot,
    anti_toxic_1,
    anti_toxic_2,
    anti_link_tt,
    anti_link_yt,
    anti_link_gc_1,
    anti_link_gc_2,
  } = data;

  await db.query(
    `UPDATE settings 
     SET bot_open=?,
         anti_ch=?, anti_wame=?, anti_link=?, anti_pl=?, 
         anti_asing=?, anti_bot=?,
         anti_toxic_1=?, anti_toxic_2=?,
         anti_link_tt=?, anti_link_yt=?,
         anti_link_gc_1=?, anti_link_gc_2=?
     WHERE group_id=?`,
    [
      bot_open,
      anti_ch, anti_wame, anti_link, anti_pl,
      anti_asing, anti_bot,
      anti_toxic_1, anti_toxic_2,
      anti_link_tt, anti_link_yt,
      anti_link_gc_1, anti_link_gc_2,
      groupId
    ]
  );
};

