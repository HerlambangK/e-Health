import Pasien from "~/server/models/Pasien";
import Dokter from "~/server/models/Dokter";
import RekamMedis from "~/server/models/RekamMedis"; // Sesuaikan dengan nama model yang benar

export default defineEventHandler(async (event) => {
  const pasienId = getRouterParam(event, "listId");

  const pasien = await Pasien.findById(pasienId)
    .populate({
      path: "dokter",
      model: Dokter, // Sesuaikan dengan nama model yang benar
    })
    .populate({
      path: "rekamedis",
      model: RekamMedis, // Sesuaikan dengan nama model yang benar
    });

  if (!pasien) {
    throw createError({
      statusCode: 404,
      message: "List not found",
    });
  }

  return pasien.toObject(); // Gunakan toObject() untuk mendapatkan objek plain JavaScript
});
