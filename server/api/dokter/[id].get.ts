import Dokter from "~/server/models/Dokter";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const dokter = await Dokter.findById(id);

    if (!dokter) {
      return sendApiError(event, 404, "not_found", "Dokter not found");
    }

    return sendSuccess(event, dokter);
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
