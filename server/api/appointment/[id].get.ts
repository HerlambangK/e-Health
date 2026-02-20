import Appointment from "~/server/models/Appointment";
import Pasien from "~/server/models/Pasien";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const appointment = await Appointment.findById(id)
      .populate({ path: "patientId", select: "nama" })
      .populate({ path: "doctorId", select: "namaDokter poli" });

    if (!appointment) {
      return sendError(event, 404, "not_found", "Appointment not found");
    }

    const user = event.context.user as any;
    if (user?.role === "patient") {
      let patientId = user.patientId;
      if (!patientId) {
        const patient = await Pasien.findOne({ userId: user._id }).select("_id");
        patientId = patient?._id;
      }

      const recordPatientId = (appointment as any).patientId?._id
        ? String((appointment as any).patientId._id)
        : String((appointment as any).patientId);

      if (!patientId || recordPatientId !== String(patientId)) {
        return sendError(event, 403, "forbidden", "Access denied");
      }
    }

    return sendSuccess(event, appointment);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
