import { whatsappClient } from "./client.js";

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


import { toxicList1, toxicList2, linkPatterns } from "../../utils/antiLists.js";
import { simpleMenu, antiMenu, allMenu } from "../../utils/menuText.js";

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
  updateList,
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
      if (text === "open") {
        await updateSetting({ ...setting, bot_open: true });
        await chat.setMessagesAdminsOnly(false);
       return message.reply(
      "🎉 *Grup dibuka!* 🎉\n" +
      "Halo bestie~ 💕\n" +
      "Yuk order aplikasi premium favoritmu 📱✨"
     
);
      }

      if (text === "close") {
        await updateSetting({ ...setting, bot_open: false });
        await chat.setMessagesAdminsOnly(true);
        return message.reply(
      "😴 *Grup ditutup dulu yaa~*\n" +
      "Bot & admin lagi rehat sebentar.\n" +
      "Sampai ketemu pas buka lagi 🤍"
    );
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

      if (text.startsWith(".updatelist")) {
        const data = textRaw.replace(".updatelist", "").trim();
        const [keyPart, ...contentPart] = data.split("@");

        if (!keyPart || contentPart.length === 0) {
           return message.reply("❌ Format salah\n.updatelist keyword@BARU");
        }

        const keyword = keyPart.trim().toLowerCase();
        const content = contentPart.join("@").trim();

        // Check exist
        const item = await getListByKeyword(keyword);
        if (!item) {
           return message.reply(`❌ List *${keyword}* tidak ditemukan`);
        }

        await updateList({ keyword, content });
        return message.reply(`✅ List *${keyword}* berhasil diupdate`);
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



    if (!setting.bot_open && !isAdmin) {
      return message.reply("🙏 Bot sedang ditutup");
    }

    // =====================
    // ANTI MENU
    // =====================
    if (text === ".antimenu") {
      return message.reply(antiMenu);
    }



    // Granular Toggles
    const toggleMap = {
      ".antich": "anti_ch",
      ".antiwame": "anti_wame",
      ".antilink": "anti_link",
      ".antipl": "anti_pl",
      ".antiasing": "anti_asing",
      ".antibot": "anti_bot",
      ".antitoxic1": "anti_toxic_1",

      ".antitoxic2": "anti_toxic_2",
      ".antilinktt": "anti_link_tt",
      ".antilinkyt": "anti_link_yt",
      ".antilinkgc1": "anti_link_gc_1",
      ".antilinkgc2": "anti_link_gc_2"
    };

    const cmdKey = Object.keys(toggleMap).find(k => text.startsWith(k + " "));
    if (isAdmin && cmdKey) {
       const status = text.split(" ")[1];
       const dbKey = toggleMap[cmdKey];
       const val = status === "on";
       await updateSetting({ ...setting, [dbKey]: val });
       return message.reply(`✅ ${cmdKey} berhasil diatur ke *${status.toUpperCase()}*`);
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
      return message.reply(simpleMenu);
    }

    if (text === ".allmenu") {
      // Sending long message might need chunking or file? for now simple reply
      return message.reply(allMenu);
    }

    if (text === "ping") {
      return message.reply("pong cuantik");
    }

    // =====================
    // ANTI SYSTEM (AUTO DELETE)
    // =====================

    // =====================
    // GRANULAR ANTI SYSTEM
    // =====================
    if (!isAdmin) {
       const msg = textRaw.toLowerCase();
 
       let violation = "";

       // 0. Anti Virtex (Payload/Long Text)
       if (setting.anti_pl && msg.length > 4000) {
           shouldDelete = true;
           violation = "Virtex / Teks Panjang";
       }

       // 1. Check Toxic
       if (setting.anti_toxic_1 && toxicList1.some(w => msg.includes(w))) {
           shouldDelete = true; 
           violation = "Toxic 1";
       }
       else if (setting.anti_toxic_2 && toxicList2.some(w => msg.includes(w))) {
           shouldDelete = true;
           violation = "Toxic 2";
       }

       // 2. Check Links
       // Antich (Channel)
       if (!shouldDelete && setting.anti_ch && linkPatterns.channel.test(msg)) {
          shouldDelete = true;
          violation = "Channel Link";
       }

       // Antiwame (Wa.me)
       if (!shouldDelete && setting.anti_wame && linkPatterns.wame.test(msg)) {
          shouldDelete = true;
          violation = "Wa.me Link";
       }

       // Antilinkgc (Group)
       if (!shouldDelete && (setting.anti_link_gc_1 || setting.anti_link_gc_2) && linkPatterns.group.test(msg)) {
          shouldDelete = true;
          violation = "Group Link";
          // Logic for gc2 (Kick) could go here but skipping for safety
       }

        // Antilinktt (Tiktok)
       if (!shouldDelete && setting.anti_link_tt && linkPatterns.tiktok.test(msg)) {
          shouldDelete = true;
          violation = "Tiktok Link";
       }

       // Antilinkyt (Youtube)
       if (!shouldDelete && setting.anti_link_yt && linkPatterns.youtube.test(msg)) {
          shouldDelete = true;
          violation = "Youtube Link";
       }

       // Antilink (General HTTP) - Paling terakhir karena paling umum
       if (!shouldDelete && setting.anti_link && linkPatterns.http.test(msg)) {
           // Exclude if it was matched by specific patterns but those features were OFF? 
           // No, general antilink kills all links usually.
           shouldDelete = true;
           violation = "Link Terlarang";
       }

       if (shouldDelete) {
          try {
             await message.delete(true);
             await chat.sendMessage(`⚠️ *ANTI ${violation.toUpperCase()}*\n@${senderNumber} pesan dihapus.`, { mentions: [sender] });
          } catch (e) {
             console.log("Failed to delete message", e);
          }
          return;
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

  whatsappClient.on("group_join", async (notification) => {
    // Only handle join events
    if (notification.type !== "add" && notification.type !== "invite") return;

    try {
      const setting = await getSetting();
      const chat = await notification.getChat();
      
      // Iterate over all recipients (support bulk add)
      for (const recipientId of notification.recipientIds) {
        const contact = await whatsappClient.getContactById(recipientId);
        
        // =====================
        // SECURITY CHECKS
        // =====================
        if (setting.anti_bot && contact.isBusiness) {
          // Kick bot
          await chat.sendMessage(`⚠️ *ANTI BOT DETECTED*\nMaaf @${contact.number}, bot dilarang masuk sini.`, { mentions: [contact] });
          await chat.removeParticipants([recipientId]);
          continue; // Skip welcome
        }

        const countryCode = contact.number.substring(0, 2);
        if (setting.anti_asing && countryCode !== "62" && countryCode !== "60") {
           // Kick foreign number (Allow Indo & Malay only)
           await chat.sendMessage(`⚠️ *ANTI ASING DETECTED*\nMaaf @${contact.number}, nomor luar negeri dilarang masuk.`, { mentions: [contact] });
           await chat.removeParticipants([recipientId]);
           continue; // Skip welcome
        }

        // Welcome Message
        const welcomeText = `
Welcome to *${chat.name}* 👋
Halo @${contact.number}!

Selamat bergabung!
Jangan lupa baca deskripsi grup ya ~
        `.trim();

        // Send message with mention
        await chat.sendMessage(welcomeText, { mentions: [contact] });
      }

    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  });

  whatsappClient.initialize();
};
