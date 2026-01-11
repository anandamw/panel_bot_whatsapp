import { whatsappClient } from "./client.js";
import { isWithinOperationalHour } from "../../utils/time.js";
import { normalizePhone } from "../../utils/phone.js";
import { getGroupAdmins, isGroupAdmin } from "../../utils/groupAdmin.js";
import { getAllPayments } from "../../repositories/paymentRepository.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import { upsertPayment } from "../../repositories/paymentRepository.js";
import {
  deletePayment,
  getPaymentByType,
} from "../../repositories/paymentRepository.js";

import path from "path";
import fs from "fs";

import {
  getSetting,
  updateSetting,
} from "../../repositories/settingRepository.js";

import {
  getAllLists,
  getListByKeyword,
  addList,
  deleteList,
} from "../../repositories/listRepository.js";

export const initWhatsApp = () => {
  whatsappClient.on("message", async (message) => {
    const chat = await message.getChat();
    if (!chat.isGroup) return;

    const textRaw = message.body.trim();
    const text = textRaw.toLowerCase();

    const sender = await message.getContact();
    const senderNumber = normalizePhone(sender.number);

    const setting = await getSetting();
    const isAdmin = await isGroupAdmin(chat, message);

    // =====================
    // ADMIN COMMAND
    // =====================
    if (isAdmin) {
      if (text === ".open") {
        await updateSetting({ ...setting, bot_open: true });
        return message.reply("✅ Bot dibuka");
      }

      if (text === ".close") {
        await updateSetting({ ...setting, bot_open: false });
        return message.reply("⛔ Bot ditutup");
      }

      if (text === "/force_on") {
        await updateSetting({ ...setting, bot_mode: "FORCE_ON" });
        return message.reply("⚡ FORCE_ON aktif");
      }

      if (text === "/force_off") {
        await updateSetting({ ...setting, bot_mode: "FORCE_OFF" });
        return message.reply("🛑 FORCE_OFF aktif");
      }

      if (text.startsWith(".addlist")) {
        const data = textRaw.replace(".addlist", "").trim();
        const [keyPart, ...contentPart] = data.split("@");

        if (!keyPart || contentPart.length === 0) {
          return message.reply("❌ Format salah\n.addlist keyword@ISI PESAN");
        }

        const keyword = keyPart.trim().toLowerCase();
        const content = contentPart.join("@").trim();

        await addList({ keyword, title: keyword, content });

        return message.reply(`✅ List *${keyword}* berhasil disimpan`);
      }

      if (text.startsWith(".dellist")) {
        const keyword = text.split(" ")[1];
        if (!keyword) {
          return message.reply("❌ Gunakan .dellist keyword");
        }

        await deleteList(keyword);
        return message.reply(`🗑️ List *${keyword}* dihapus`);
      }

      // =====================
      // ADD / UPDATE PAYMENT (IMAGE)
      // =====================
      if (isAdmin && text.startsWith(".addpay")) {
        if (!message.hasMedia) {
          return message.reply("❌ Kirim GAMBAR dengan caption:\n.addpay qris");
        }

        const lines = textRaw.split("\n");
        const firstLine = lines[0];
        const captionText = lines.slice(1).join("\n").trim();

        const type = firstLine.split(" ")[1];
        if (!type) {
          return message.reply("❌ Gunakan: .addpay qris / dana / gopay");
        }

        if (!captionText) {
          return message.reply("❌ Caption payment tidak boleh kosong");
        }

        const media = await message.downloadMedia();
        if (!media.mimetype.startsWith("image/")) {
          return message.reply("❌ File harus gambar");
        }

        const ext = media.mimetype.split("/")[1];
        const fileName = `${type}.${ext}`;
        const filePath = path.join("src/assets/payment", fileName);

        await fs.promises.writeFile(
          filePath,
          Buffer.from(media.data, "base64")
        );

        await upsertPayment({
          type,
          label: type.toUpperCase(),
          image: fileName,
          caption: captionText,
        });

        return message.reply(
          `✅ Payment *${type.toUpperCase()}* berhasil disimpan`
        );
      }
    }

    // =====================
    // DELETE PAYMENT
    // =====================
    if (isAdmin && text.startsWith(".delpay")) {
      const type = text.split(" ")[1];

      if (!type) {
        return message.reply(
          "❌ Format salah\n\n.delpay <nama_payment>\n\nContoh:\n.delpay qris"
        );
      }

      const payment = await getPaymentByType(type.toLowerCase());
      if (!payment) {
        return message.reply(`❌ Payment *${type}* tidak ditemukan`);
      }

      await deletePayment(type.toLowerCase());

      return message.reply(
        `🗑️ Metode pembayaran *${type.toUpperCase()}* berhasil dihapus`
      );
    }

    // =====================
    // MODE CHECK (CUSTOMER)
    // =====================
    if (setting.bot_mode === "FORCE_OFF" && !isAdmin) return;

    if (setting.bot_mode === "AUTO" && !isAdmin) {
      const active = isWithinOperationalHour(
        setting.open_hour,
        setting.close_hour
      );
      if (!active) {
        return message.reply(
          "🙏 Di luar jam operasional\n⏰ 08.00 – 22.00 WIB"
        );
      }
    }

    if (!setting.bot_open && !isAdmin) {
      return message.reply("🙏 Bot sedang ditutup");
    }

    // =====================
    // ANTI MENU
    // =====================
    if (text === ".antimenu") {
      const antiMenu = `
  ╭───── 私❛❛ *ANTI MENU*
  │
  │ ♡゙ Antich
  │ ♡゙ Antiwame
  │ ♡゙ Antilink
  │ ♡゙ Antipl
  │ ♡゙ Antitoxic1
  │ ♡゙ Antitoxic2
  │ ♡゙ Antilinktt
  │ ♡゙ Antilinkyt
  │ ♡゙ Antilinkgc
  │
  │ ⚙️ *Control*
  │ ┆𖢷 .anti on
  │ ┆𖢷 .anti off
  │
  ╰───────────────╯
    `.trim();

      return message.reply(antiMenu);
    }

    if (isAdmin && text === ".anti on") {
      await updateSetting({ ...setting, anti_enabled: true });
      return message.reply("🛡️ Anti system *AKTIF*");
    }

    if (isAdmin && text === ".anti off") {
      await updateSetting({ ...setting, anti_enabled: false });
      return message.reply("❌ Anti system *DIMATIKAN*");
    }

    // =====================
    // LIST PRODUK
    // =====================
    if (text === "list") {
      const lists = await getAllLists();
      if (lists.length === 0) {
        return message.reply("📦 Belum ada produk");
      }

      const productLines = lists
        .map((item) => `   ┆𖢷.  *${item.keyword}*`)
        .join("\n");

      const reply = `
⣠⣶⣶⣶⣦ 
⣠⣤⣤⣄⣀⣾⣿⠟⠛⠻⢿⣷ 
⢰⣿⡿⠛⠙⠻⣿⣿⠁ ⣶⢿⡇
⢿⣿⣇ ⠈⠏ ⸼   ۫ cute ー baby! ♡⃕  

— ketik list to see our pricelist 𖢷 ׁ ִ
╭────── · · ୨୧ · · ──────╮
┆# cek stock sebelum order!
${productLines}
┆꒰ ketik sesuai keyword ꒱
╰────── · · ୨୧ · · ──────╯
      `.trim();

      return message.reply(reply);
    }

    // =====================
    // ORDER + TAG ADMIN
    // =====================
    if (text.startsWith(".order")) {
      const keyword = text.split(" ")[1];
      if (!keyword) {
        return message.reply("❌ Gunakan .order <produk>");
      }

      const item = await getListByKeyword(keyword);
      if (!item) {
        return message.reply("❌ Produk tidak ditemukan");
      }

      const admins = await getGroupAdmins(chat);

      const orderMsg = `
🛒 *ORDER BARU*

📦 Produk : *${item.keyword}*
👤 Pemesan : @${senderNumber}

📌 Format Order:
- Email / Username :
- Paket :
- Durasi :
- Metode Pembayaran :
      `.trim();

      await chat.sendMessage(orderMsg, { mentions: admins });
      return;
    }

    // =====================
    // PAYMENT INFO
    // =====================
    if (text === ".pay") {
      const payments = await getAllPayments();

      // 🔥 JIKA BELUM ADA PAYMENT
      if (payments.length === 0) {
        return message.reply(
          "💳 Metode pembayaran belum tersedia.\nSilakan hubungi admin untuk melanjutkan order 💖"
        );
      }

      for (const pay of payments) {
        const imgPath = `src/assets/payment/${pay.image}`;
        if (!fs.existsSync(imgPath)) continue;

        const media = MessageMedia.fromFilePath(imgPath);
        await chat.sendMessage(media, {
          caption: pay.caption,
        });
      }

      return;
    }

    if (text === ".menu") {
      const menu = `
      ╭─── 〔 🤖 BOT MENU 〕 ───╮
      │
      │ 📦 *PRODUK*
      │ ┆𖢷 .list
      │ ┆𖢷 .order <produk>
      │
      │ 💳 *PEMBAYARAN*
      │ ┆𖢷 .pay
      │
      │ ℹ️ *INFO*
      │ ┆𖢷 ketik *keyword produk*
      │
      │ 👑 *ADMIN*
      │ ┆𖢷 .addlist keyword@isi
      │ ┆𖢷 .dellist keyword
      │ ┆𖢷 .addpay qris (dgn gambar)
      │ ┆𖢷 .delpay qris
      │ ┆𖢷 .open / .close
      │
      ╰───────────────╯
      💖 Ketik perintah tanpa tanda *
        `.trim();

      return message.reply(menu);
    }

    if (text === "ping") {
      return message.reply("pong cuantik");
    }

    // =====================
    // ANTI SYSTEM (AUTO DELETE)
    // =====================

    if (setting.anti_enabled && !isAdmin) {
      const msg = textRaw.toLowerCase();

      if (
        msg.includes("http://") ||
        msg.includes("https://") ||
        msg.includes("wa.me") ||
        msg.includes("chat.whatsapp.com")
      ) {
        try {
          await message.delete(true);
        } catch {}

        return chat.sendMessage(
          `⚠️ *ANTI LINK*\n@${senderNumber} link tidak diperbolehkan`,
          { mentions: [sender] }
        );
      }

      const toxicWords = [
        "anjing",
        "kontol",
        "kntl",
        "bangsat",
        "ngentot",
        "jancok",
        "goblok",
        "memek",
        "asu",
        "puki",
        "babi",
        "otak",
        "mmk",
        "mmq",
      ];
      if (toxicWords.some((w) => msg.includes(w))) {
        try {
          await message.delete(true);
        } catch {}

        return chat.sendMessage(
          `🚫 *ANTI TOXIC*\n@${senderNumber} jaga kata-kata ya`,
          { mentions: [sender] }
        );
      }
    }

    // =====================
    // AUTO REPLY LIST DETAIL
    // =====================
    const item = await getListByKeyword(text);
    if (item) {
      return message.reply(item.content);
    }
  });

  whatsappClient.initialize();
};
