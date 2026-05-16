import Pasien from "~/server/models/Pasien";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const deleted = await Pasien.findByIdAndDelete(id);

    if (!deleted) {
      return sendApiError(event, 404, "not_found", "Pasien not found");
    }

    return sendSuccess(event, deleted);
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
