// import Pasien from "~/server/models/Pasien";

import Dokter from "~/server/models/Dokter";

export default defineEventHandler(async (event) => {
  const dokter = await Dokter.find();

  if (!dokter) {
    throw createError({
      statusCode: 404,
      message: "pasien not found",
    });
  }
  // return { statusCode: 200, body: JSON.stringify(pasienList) };

  return { statusCode: 200, body: dokter };
});
