import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import { logger } from "../../utils/logger.js";

export const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

whatsappClient.on("qr", (qr) => {
  logger.info("Scan QR Code di bawah ini");
  qrcode.generate(qr, { small: true });
});

whatsappClient.on("ready", () => {
  logger.info("WhatsApp Client READY");
});

whatsappClient.on("auth_failure", (msg) => {
  logger.error(`Auth failure: ${msg}`);
});

whatsappClient.on("disconnected", (reason) => {
  logger.error(`WhatsApp disconnected: ${reason}`);
});
