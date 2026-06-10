import Poli from "~/server/models/Poli";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const poli = await Poli.findByIdAndUpdate(id, body, { new: true });
  if (!poli) throw createError({ statusCode: 404, message: "Poli tidak ditemukan" });
  return { data: poli };
});
