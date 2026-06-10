import Rujukan from "~/server/models/Rujukan";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (query.tipe) filter.tipe = query.tipe;
  if (query.pasienId) filter.pasienId = query.pasienId;

  const data = await Rujukan.find(filter)
    .populate("pasienId", "nama noRM")
    .populate("poliTujuan", "nama")
    .sort({ createdAt: -1 });

  return { data };
});
