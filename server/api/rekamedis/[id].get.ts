import RekamMedis from "~/server/models/RekamMedis";
import Pasien from "~/server/models/Pasien";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const rekamedis = await RekamMedis.findById(id)
      .populate({ path: "namaPasien", select: "nama" })
      .populate({ path: "dokter", select: "namaDokter poli" });

    if (!rekamedis) {
      return sendError(event, 404, "not_found", "Rekam medis not found");
    }

    const user = event.context.user as any;
    if (user?.role === "patient") {
      let patientId = user.patientId;
      if (!patientId) {
        const patient = await Pasien.findOne({ userId: user._id }).select("_id");
        patientId = patient?._id;
      }

      const recordPatientId = (rekamedis as any).namaPasien?._id
        ? String((rekamedis as any).namaPasien._id)
        : String((rekamedis as any).namaPasien);

      if (!patientId || recordPatientId !== String(patientId)) {
        return sendError(event, 403, "forbidden", "Access denied");
      }
    }

    return sendSuccess(event, rekamedis);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
