import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { initWhatsApp } from "./services/whatsapp/index.js";

app.listen(env.port, () => {
  logger.info(`${env.appName} running on port ${env.port}`);
});

// init whatsapp
initWhatsApp();
