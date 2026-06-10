import Poli from "~/server/models/Poli";

export default defineEventHandler(async () => {
  const poli = await Poli.find({ isActive: true }).sort({ nama: 1 });
  return { data: poli };
});
