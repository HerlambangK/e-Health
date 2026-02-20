import { getQuery } from "h3";
import Appointment from "~/server/models/Appointment";
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
      filter.patientId = patientId;
    }

    if (query.patientId) filter.patientId = query.patientId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.status) filter.status = query.status;

    if (query.from || query.to) {
      const range: Record<string, any> = {};
      if (query.from) range.$gte = new Date(query.from);
      if (query.to) range.$lte = new Date(query.to);
      filter.startAt = range;
    }

    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .populate({ path: "patientId", select: "nama" })
        .populate({ path: "doctorId", select: "namaDokter poli" })
        .skip(skip)
        .limit(pageSize)
        .sort({ startAt: 1 }),
      Appointment.countDocuments(filter),
    ]);

    return sendSuccess(event, items, 200, { page, pageSize, total });
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
