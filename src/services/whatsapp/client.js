import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import { logger } from "../../utils/logger.js";

export const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--single-process",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-component-extensions-with-background-pages",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--disable-renderer-backgrounding",
      "--enable-features=NetworkService,NetworkServiceInProcess",
      "--force-color-profile=srgb",
    ],
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
