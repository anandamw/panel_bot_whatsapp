import { db } from '../database/mysql.js';

export const getSetting = async () => {
  const [rows] = await db.query(
    'SELECT * FROM settings WHERE id = 1'
  );
  return rows[0];
};

export const updateSetting = async (data) => {
  const {
    bot_open,
    bot_mode,
    open_hour,
    close_hour,
  } = data;

  await db.query(
    `UPDATE settings 
     SET bot_open=?, bot_mode=?, open_hour=?, close_hour=? 
     WHERE id=1`,
    [bot_open, bot_mode, open_hour, close_hour]
  );
};
