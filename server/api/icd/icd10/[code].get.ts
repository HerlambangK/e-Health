import ICD10 from "~/server/models/ICD10";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const data = await ICD10.findOne({ code });

  if (!data) throw createError({ statusCode: 404, message: "Kode ICD-10 tidak ditemukan" });

  return { data };
});
