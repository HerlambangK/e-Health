import Resep from "~/server/models/Resep";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await Resep.findByIdAndUpdate(id, { status: "cancelled" });

  return { data: { message: "Resep dibatalkan" } };
});
