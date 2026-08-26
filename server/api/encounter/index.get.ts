import { getQuery } from "h3";
import Encounter from "~/server/models/Encounter";
import { parsePagination } from "~/server/utils/pagination";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as Record<string, any>;
    const { page, pageSize, skip } = parsePagination(query);
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

    const [encounters, total] = await Promise.all([
      Encounter.find(filter)
        .populate("pasienId", "nama noRM nik")
        .populate("dokterId", "namaDokter")
        .populate("poliId", "nama kode")
        .sort({ tanggalMulai: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Encounter.countDocuments(filter)
    ]);

    return sendSuccess(event, encounters, 200, { page, pageSize, total });
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
