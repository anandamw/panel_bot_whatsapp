import { normalizePhone } from "./phone.js";

export const isGroupAdmin = async (chat, message) => {
  if (!chat.isGroup) return false;

  // ambil contact pengirim (nomor asli)
  const sender = await message.getContact();
  if (!sender || !sender.number) return false;

  const senderNumber = normalizePhone(sender.number);

  // participants SUDAH ADA
  const participants = chat.participants;
  if (!participants || participants.length === 0) return false;

  const participant = participants.find((p) => {
    const participantNumber = normalizePhone(p.id.user);
    return participantNumber === senderNumber;
  });

  if (!participant) return false;

  return participant.isAdmin || participant.isSuperAdmin;
};

export const getGroupAdmins = async (chat) => {
  if (!chat.isGroup) return [];

  // pastikan participants ada
  const participants = chat.participants || [];

  return participants
    .filter((p) => p.isAdmin || p.isSuperAdmin)
    .map((p) => `${p.id.user}@c.us`);
};
