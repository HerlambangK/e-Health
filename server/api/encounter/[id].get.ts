import Encounter from "~/server/models/Encounter";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const encounter = await Encounter.findById(id)
    .populate("pasienId")
    .populate("dokterId")
    .populate("poliId");

  if (!encounter) throw createError({ statusCode: 404, message: "Encounter tidak ditemukan" });

  return { data: encounter };
});
