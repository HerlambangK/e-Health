import Resep from "~/server/models/Resep";

export default defineEventHandler(async () => {
  const resep = await Resep.find({
    status: { $in: ["active", "on_hold"] },
  })
    .populate("pasienId", "nama noRM")
    .populate("dokterId", "namaDokter")
    .lean().sort({ createdAt: 1 });

  return { data: resep };
});
