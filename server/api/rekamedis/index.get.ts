import { getQuery } from "h3";
import RekamMedis from "~/server/models/RekamMedis";
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
      let patientId = user.patientId;
      if (!patientId) {
        const patient = await Pasien.findOne({ userId: user._id }).select("_id");
        patientId = patient?._id;
      }
      if (!patientId) {
        return sendError(event, 403, "forbidden", "Patient record not linked");
      }
      filter.namaPasien = patientId;
    }

    if (query.patientId) {
      filter.namaPasien = query.patientId;
    }

    if (query.doctorId) {
      filter.dokter = query.doctorId;
    }

    if (query.from || query.to) {
      const range: Record<string, any> = {};
      if (query.from) range.$gte = query.from;
      if (query.to) range.$lte = query.to;
      filter.kontrolTerakhir = range;
    }

    if (query.q) {
      const regex = new RegExp(String(query.q), "i");
      filter.$or = [
        { keluhan: regex },
        { catatan: regex },
        { diagnosis: regex },
      ];
    }

    const [items, total] = await Promise.all([
      RekamMedis.find(filter)
        .populate({ path: "namaPasien", select: "nama" })
        .populate({ path: "dokter", select: "namaDokter poli" })
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      RekamMedis.countDocuments(filter),
    ]);

    return sendSuccess(event, items, 200, { page, pageSize, total });
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
