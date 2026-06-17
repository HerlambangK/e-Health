import { getQuery } from "h3";
import Encounter from "~/server/models/Encounter";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.pasienId) filter.pasienId = query.pasienId;
  if (query.tanggal) {
    const date = new Date(query.tanggal as string);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.tanggalMulai = {
      $gte: startOfDay,
      $lt: endOfDay,
    };
  }
  if (query.status) filter.status = query.status;

  const encounters = await Encounter.find(filter)
    .populate("pasienId", "nama noRM nik")
    .populate("dokterId", "namaDokter")
    .populate("poliId", "nama kode")
    .sort({ tanggalMulai: -1 });

  return { data: encounters };
});
