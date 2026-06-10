import Resep from "~/server/models/Resep";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const resep = await Resep.findById(id)
    .populate("pasienId")
    .populate("dokterId")
    .populate("encounterId");

  if (!resep) throw createError({ statusCode: 404, message: "Resep tidak ditemukan" });

  return { data: resep };
});
