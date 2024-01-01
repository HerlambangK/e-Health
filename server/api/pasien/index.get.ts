import Pasien from "~/server/models/Pasien";

export default defineEventHandler(async (event) => {
  try {
    const pasienList = await Pasien.find()
      .populate({
        path: "dokter",
        select: "namaDokter",
      })
      .populate({
        path: "rekamedis",
        select: "_id",
      });

    if (!pasienList || pasienList.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Pasien not found",
      });
    }

    // Format data sesuai kebutuhan Anda
    const formattedData = pasienList.map((pasien) => {
      return {
        nama: pasien.nama,
        umur: pasien.umur,
        address: pasien.address,
        notlp: pasien.notlp,
        dokter: pasien.dokter ? pasien.dokter.namaDokter : null,
        poli: pasien.poli,
        jenisAsuransi: pasien.jenisAsuransi,
        rekamedis: pasien.rekamedis ? pasien.rekamedis._id : null,
        fotoProfil: pasien.fotoProfil,
        riwayatPenyakit: pasien.riwayatPenyakit,
        completedStatus: pasien.completedStatus,
      };
    });

    // return { statusCode: 200, body: JSON.stringify(formattedData) };
    return { statusCode: 200, body: formattedData };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
});
