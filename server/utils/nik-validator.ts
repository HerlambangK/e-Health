export function validateNIK(nik: string): { valid: boolean; message?: string } {
  if (!nik || nik.length !== 16) {
    return { valid: false, message: "NIK harus 16 digit" };
  }

  if (!/^\d{16}$/.test(nik)) {
    return { valid: false, message: "NIK hanya boleh berisi angka" };
  }

  return { valid: true };
}

export function extractNIKInfo(nik: string): {
  province?: string;
  regency?: string;
  birthDate?: string;
  gender?: "L" | "P";
} | null {
  if (!/^\d{16}$/.test(nik)) return null;

  const provinceCode = nik.substring(0, 2);
  const regencyCode = nik.substring(0, 4);
  const birthDateRaw = nik.substring(6, 12);

  let day = parseInt(birthDateRaw.substring(0, 2), 10);
  const month = parseInt(birthDateRaw.substring(2, 4), 10);
  const year = parseInt(birthDateRaw.substring(4, 6), 10);

  let gender: "L" | "P" = "L";
  if (day > 40) {
    day -= 40;
    gender = "P";
  }

  const birthDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${
    year < 24 ? "20" : "19"
  }${year.toString().padStart(2, "0")}`;

  return {
    province: provinceCode,
    regency: regencyCode,
    birthDate,
    gender,
  };
}
