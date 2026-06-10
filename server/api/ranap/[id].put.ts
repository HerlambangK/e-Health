import Ranap from "~/server/models/Ranap";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const ranap = await Ranap.findByIdAndUpdate(id, body, { new: true });

  if (!ranap) throw createError({ statusCode: 404, message: "Ranap tidak ditemukan" });

  return { data: ranap };
});
