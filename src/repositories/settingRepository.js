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
     WHERE id=1`,
    [
      bot_open,
      anti_ch, anti_wame, anti_link, anti_pl,
      anti_asing, anti_bot,
      anti_toxic_1, anti_toxic_2,
      anti_link_tt, anti_link_yt,
      anti_link_gc_1, anti_link_gc_2
    ]
  );
};
