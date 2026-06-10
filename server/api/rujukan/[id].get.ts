import Rujukan from "~/server/models/Rujukan";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const rujukan = await Rujukan.findById(id)
    .populate("pasienId")
    .populate("poliTujuan");

  if (!rujukan) throw createError({ statusCode: 404, message: "Rujukan tidak ditemukan" });

  return { data: rujukan };
});
