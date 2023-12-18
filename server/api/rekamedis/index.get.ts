import RekamMedis from "~/server/models/RekamMedis";

export default defineEventHandler(async (event) => {
  const rekamedis = await RekamMedis.find();

  if (!rekamedis) {
    throw createError({
      statusCode: 404,
      message: "pasien not found",
    });
  }
  // return { statusCode: 200, body: JSON.stringify(pasienList) };

  return { statusCode: 200, body: JSON.stringify(rekamedis) };
});
