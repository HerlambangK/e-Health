import Billing from "~/server/models/Billing";
import Pasien from "~/server/models/Pasien";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const billing = await Billing.findById(id).populate({ path: "patientId", select: "nama" });

    if (!billing) {
      return sendError(event, 404, "not_found", "Billing not found");
    }

    const user = event.context.user as any;
    if (user?.role === "patient") {
      let patientId = user.patientId;
      if (!patientId) {
        const patient = await Pasien.findOne({ userId: user._id }).select("_id");
        patientId = patient?._id;
      }

      const recordPatientId = (billing as any).patientId?._id
        ? String((billing as any).patientId._id)
        : String((billing as any).patientId);

      if (!patientId || recordPatientId !== String(patientId)) {
        return sendError(event, 403, "forbidden", "Access denied");
      }
    }

    return sendSuccess(event, billing);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
