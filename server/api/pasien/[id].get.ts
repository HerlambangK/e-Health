import Pasien from "~/server/models/Pasien";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const user = event.context.user as any;

    if (user?.role === "patient") {
      let patientId = user.patientId;
      if (!patientId) {
        const patient = await Pasien.findOne({ userId: user._id }).select("_id");
        patientId = patient?._id;
      }
      if (!patientId || String(patientId) !== id) {
        return sendError(event, 403, "forbidden", "Access denied");
      }
    }
    const pasien = await Pasien.findById(id)
      .populate({ path: "dokter", select: "namaDokter" })
      .populate({ path: "rekamedis", select: "_id" });

    if (!pasien) {
      return sendError(event, 404, "not_found", "Pasien not found");
    }

    return sendSuccess(event, pasien);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
