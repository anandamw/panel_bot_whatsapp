export const BOT_MODE = {
  AUTO: "AUTO",
  FORCE_ON: "FORCE_ON",
  FORCE_OFF: "FORCE_OFF",
};

export const botState = {
  isOpen: true,
  mode: BOT_MODE.AUTO,

  operationalHour: {
    open: "08:00",
    close: "22:00",
    timezone: "Asia/Jakarta",
  },
};
