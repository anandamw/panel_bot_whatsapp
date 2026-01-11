export const normalizePhone = (number) => {
  if (!number) return null;

  let phone = number.replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = "62" + phone.slice(1);
  }

  if (!phone.startsWith("62")) {
    phone = "62" + phone;
  }

  return phone;
};
