import Tindakan from "~/server/models/Tindakan";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.encounterId) filter.encounterId = query.encounterId;
  if (query.pasienId) filter.pasienId = query.pasienId;

  const data = await Tindakan.find(filter)
    .populate("dokterId", "namaDokter")
    .sort({ waktu: -1 });

  return { data };
});
