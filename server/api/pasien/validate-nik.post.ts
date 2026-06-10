import Pasien from "~/server/models/Pasien";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const nik = body.nik;

  if (!nik || nik.length !== 16) {
    throw createError({ statusCode: 400, message: "NIK harus 16 digit" });
  }

  const existing = await Pasien.findOne({ nik });
  if (existing) {
    return { data: existing, isNew: false };
  }

  return {
    data: {
      nik,
      nama: "",
      tgl_lahir: null,
      jenis_kelamin: null,
      alamat: {
        jalan: "",
        kota: "",
        provinsi: "",
      },
    },
    isNew: true,
  };
});
