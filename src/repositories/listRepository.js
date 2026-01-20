import { db } from "../database/mysql.js";

export const getAllLists = async (groupId) => {
  const [rows] = await db.query(
    "SELECT keyword, title FROM lists WHERE group_id = ? ORDER BY keyword ASC",
    [groupId]
  );
  return rows;
};

export const getListByKeyword = async (groupId, keyword) => {
  const [rows] = await db.query(
    "SELECT * FROM lists WHERE group_id = ? AND keyword = ?",
    [groupId, keyword]
  );
  return rows[0];
};

export const addList = async ({ groupId, keyword, title, content }) => {
  await db.query(
    "INSERT INTO lists (group_id, keyword, title, content) VALUES (?, ?, ?, ?)",
    [groupId, keyword, title, content]
  );
};

export const deleteList = async (groupId, keyword) => {
  await db.query("DELETE FROM lists WHERE group_id = ? AND keyword = ?", [
    groupId,
    keyword,
  ]);
};

export const updateList = async ({ groupId, keyword, content }) => {
  await db.query(
    "UPDATE lists SET content = ? WHERE group_id = ? AND keyword = ?",
    [content, groupId, keyword]
  );
};

