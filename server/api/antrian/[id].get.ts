import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const antrian = await Antrian.findById(id)
    .populate("pasienId")
    .populate("poliId")
    .populate("dokterId")
    .lean();

  if (!antrian) throw createError({ statusCode: 404, message: "Antrian tidak ditemukan" });

  return { data: antrian };
});
