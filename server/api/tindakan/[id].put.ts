import Tindakan from "~/server/models/Tindakan";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const tindakan = await Tindakan.findByIdAndUpdate(id, body, { new: true });

  if (!tindakan) throw createError({ statusCode: 404, message: "Tindakan tidak ditemukan" });

  return { data: tindakan };
});
