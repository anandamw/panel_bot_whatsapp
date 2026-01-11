import { ADMIN_NUMBERS } from "../config/admin.js";
import { botState, BOT_MODE } from "../state/botState.js";

export const botGuard = ({ message, chat }) => {
  const isGroup = chat.isGroup;
  const isAdmin = ADMIN_NUMBERS.includes(message.from);

  // FORCE OFF → hanya admin
  if (botState.mode === BOT_MODE.FORCE_OFF && !isAdmin) {
    return { allowed: false };
  }

  // hanya grup (kecuali admin)
  if (!isGroup && !isAdmin) {
    return { allowed: false };
  }

  return { allowed: true, isAdmin };
};
