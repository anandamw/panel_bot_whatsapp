import { db } from "../database/mysql.js";
import fs from "fs";
import path from "path";

const PAYMENT_DIR = path.join(process.cwd(), "src/assets/payment");

// =====================
// GET ALL PAYMENTS
// =====================
export const getAllPayments = async (groupId) => {
  const [rows] = await db.query("SELECT * FROM payments WHERE group_id = ?", [groupId]);
  return rows;
};

// =====================
// UPSERT PAYMENT
// =====================
export const upsertPayment = async ({ groupId, type, image, caption }) => {
  await db.query(
    `
    INSERT INTO payments (group_id, type, image, caption)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      image = VALUES(image),
      caption = VALUES(caption)
    `,
    [groupId, type, image, caption]
  );
};

// =====================
// GET PAYMENT BY TYPE
// =====================
export const getPaymentByType = async (groupId, type) => {
  const [rows] = await db.query(
    "SELECT * FROM payments WHERE group_id = ? AND type = ? LIMIT 1",
    [groupId, type]
  );
  return rows[0];
};

// =====================
// DELETE PAYMENT
// =====================
export const deletePayment = async (groupId, type) => {
  const payment = await getPaymentByType(groupId, type);
  if (!payment) return null;

  // hapus file gambar jika ada
  if (payment.image) {
    const imagePath = path.join(PAYMENT_DIR, payment.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await db.query("DELETE FROM payments WHERE group_id = ? AND type = ?", [groupId, type]);
  return payment;
};

