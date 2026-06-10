import Resep from "~/server/models/Resep";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.encounterId) filter.encounterId = query.encounterId;
  if (query.pasienId) filter.pasienId = query.pasienId;
  if (query.status) filter.status = query.status;

  const resep = await Resep.find(filter)
    .populate("pasienId", "nama noRM")
    .populate("dokterId", "namaDokter")
    .sort({ createdAt: -1 });

  return { data: resep };
});
