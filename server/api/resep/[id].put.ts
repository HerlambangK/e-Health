import Resep from "~/server/models/Resep";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  const resep = await Resep.findById(id);
  if (!resep) throw createError({ statusCode: 404, message: "Resep tidak ditemukan" });
  if (resep.status === "dispensed") {
    throw createError({ statusCode: 400, message: "Resep sudah didispense, tidak bisa diedit" });
  }

  Object.assign(resep, body);
  await resep.save();

  return { data: resep };
});
