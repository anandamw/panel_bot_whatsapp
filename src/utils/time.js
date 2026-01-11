export const isWithinOperationalHour = (open, close) => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const [currentHour, currentMinute] = formatter
    .format(now)
    .split(":")
    .map(Number);

  const [openHour, openMinute] = open.split(":").map(Number);
  const [closeHour, closeMinute] = close.split(":").map(Number);

  const current = currentHour * 60 + currentMinute;
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return current >= openTime && current <= closeTime;
};
