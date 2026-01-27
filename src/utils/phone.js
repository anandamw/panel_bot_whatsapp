export const normalizePhone = (number) => {
  if (!number) return null;

  // Hapus semua karakter non-digit
  let phone = number.replace(/\D/g, "");

  // Jika diawali 0, ubah jadi 62 (asumsi Indo jika pakai 0)
  if (phone.startsWith("0")) {
    phone = "62" + phone.slice(1);
    return phone;
  }

  // Jika sudah punya kode negara (minimal 10 digit total), biarkan saja
  // Ini mendeteksi jika sudah diawali 62, 60, dll.
  // Jika terlalu pendek (misal cuma "812..."), baru tambahkan 62
  if (phone.length < 10) {
     phone = "62" + phone;
  }

  return phone;
};
