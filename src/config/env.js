import dotenv from "dotenv";

dotenv.config();

export const env = {
  appName: process.env.APP_NAME || "WA BOT",
  port: process.env.PORT || 3000,
};
