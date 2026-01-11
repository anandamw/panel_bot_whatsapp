import { db } from "../database/mysql.js";
import fs from "fs";
import path from "path";

const PAYMENT_DIR = path.join(process.cwd(), "src/assets/payment");

// =====================
// GET ALL PAYMENTS
// =====================
export const getAllPayments = async () => {
  const [rows] = await db.query("SELECT * FROM payments");
  return rows;
};

// =====================
// UPSERT PAYMENT
// =====================
export const upsertPayment = async ({ type, image, caption }) => {
  await db.query(
    `
    INSERT INTO payments (type, image, caption)
    VALUES (?,   ?, ?)
    ON DUPLICATE KEY UPDATE
      image = VALUES(image),
      caption = VALUES(caption)
    `,
    [type, image, caption]
  );
};

// =====================
// GET PAYMENT BY TYPE
// =====================
export const getPaymentByType = async (type) => {
  const [rows] = await db.query(
    "SELECT * FROM payments WHERE type = ? LIMIT 1",
    [type]
  );
  return rows[0];
};

// =====================
// DELETE PAYMENT
// =====================
export const deletePayment = async (type) => {
  const payment = await getPaymentByType(type);
  if (!payment) return null;

  // hapus file gambar jika ada
  if (payment.image) {
    const imagePath = path.join(PAYMENT_DIR, payment.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await db.query("DELETE FROM payments WHERE type = ?", [type]);
  return payment;
};
