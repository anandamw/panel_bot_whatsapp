import { db } from "../database/mysql.js";

export const getAllLists = async () => {
  const [rows] = await db.query(
    "SELECT keyword, title FROM lists ORDER BY keyword ASC"
  );
  return rows;
};

export const getListByKeyword = async (keyword) => {
  const [rows] = await db.query("SELECT * FROM lists WHERE keyword = ?", [
    keyword,
  ]);
  return rows[0];
};

export const addList = async ({ keyword, title, content }) => {
  await db.query(
    "INSERT INTO lists (keyword, title, content) VALUES (?, ?, ?)",
    [keyword, title, content]
  );
};

export const deleteList = async (keyword) => {
  await db.query("DELETE FROM lists WHERE keyword = ?", [keyword]);
};
