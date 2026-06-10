import Poli from "~/server/models/Poli";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const poli = await Poli.findById(id);
  if (!poli) throw createError({ statusCode: 404, message: "Poli tidak ditemukan" });
  return { data: poli };
});
