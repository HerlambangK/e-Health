import Ranap from "~/server/models/Ranap";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (query.ruangan) filter.ruangan = query.ruangan;

  const data = await Ranap.find(filter)
    .populate("pasienId", "nama noRM nik")
    .populate("dpjpId", "namaDokter")
    .populate("bedId")
    .sort({ createdAt: -1 });

  return { data };
});
