import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const antrian = await Antrian.findByIdAndUpdate(id, body, { new: true });

  if (!antrian) throw createError({ statusCode: 404, message: "Antrian tidak ditemukan" });

  return { data: antrian };
});
