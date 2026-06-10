import ICD9CM from "~/server/models/ICD9CM";

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const data = await ICD9CM.findOne({ code });

  if (!data) throw createError({ statusCode: 404, message: "Kode ICD-9CM tidak ditemukan" });

  return { data };
});
