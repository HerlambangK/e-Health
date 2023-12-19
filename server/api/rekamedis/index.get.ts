import RekamMedis from "~/server/models/RekamMedis";

export default defineEventHandler(async (event) => {
  try {
    // Ambil semua data rekam medis beserta data pasien dan dokter terkait
    const rekamedisList = await RekamMedis.find()
      .populate({
        path: "namaPasien",
        select: "nama",
      })
      .populate({
        path: "dokter",
        select: "namaDokter poli",
      });

    if (!rekamedisList || rekamedisList.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Data rekam medis not found",
      });
    }

    // Format data sesuai kebutuhan Anda
    const formattedData = rekamedisList.map((rekamedis) => {
      return {
        _id: rekamedis._id,
        namaPasien: rekamedis.namaPasien ? rekamedis.namaPasien.nama : null,
        namaDokter: rekamedis.dokter ? rekamedis.dokter.namaDokter : null,
        poli: rekamedis.dokter ? rekamedis.dokter.poli : null,
        keluhan: rekamedis.keluhan,
        tensiSistol: rekamedis.tensiSistol,
        tensiDiastol: rekamedis.tensiDiastol,
        guladarah: rekamedis.guladarah,
        kontrolTerakhir: rekamedis.kontrolTerakhir,
        obat: rekamedis.obat,
        catatan: rekamedis.catatan,
        __v: rekamedis.__v,
      };
    });

    return { statusCode: 200, body: JSON.stringify(formattedData) };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
});
