import Ranap from "~/server/models/Ranap";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const ranap = await Ranap.findById(id)
    .populate("pasienId")
    .populate("encounterId")
    .populate("dpjpId")
    .populate("dokterKonsulId")
    .populate("bedId");

  if (!ranap) throw createError({ statusCode: 404, message: "Ranap tidak ditemukan" });

  return { data: ranap };
});
