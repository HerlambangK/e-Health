import { getQuery } from "h3";
import Pasien from "~/server/models/Pasien";
import { parsePagination } from "~/server/utils/pagination";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as Record<string, any>;
    const { page, pageSize, skip } = parsePagination(query);

    const filter: Record<string, any> = {};
    const user = event.context.user as any;

    if (user?.role === "patient") {
      if (user.patientId) {
        filter._id = user.patientId;
      } else {
        filter.userId = user._id;
      }
    }

    if (query.doctorId) {
      filter.dokter = query.doctorId;
    }

    if (query.poli) {
      filter.poli = query.poli;
    }

    if (query.status) {
      filter.completedStatus = query.status === "true" || query.status === true;
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.q) {
      const regex = new RegExp(String(query.q), "i");
      filter.$or = [
        { nama: regex },
        { address: regex },
        { notlp: regex },
        { jenisAsuransi: regex },
      ];
    }

    const [items, total] = await Promise.all([
      Pasien.find(filter)
        .populate({ path: "dokter", select: "namaDokter" })
        .populate({ path: "rekamedis", select: "_id" })
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Pasien.countDocuments(filter),
    ]);

    return sendSuccess(event, items, 200, { page, pageSize, total });
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
