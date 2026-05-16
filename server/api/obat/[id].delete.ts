import Obat from "~/server/models/Obat";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const deleted = await Obat.findByIdAndDelete(id);

    if (!deleted) {
      return sendApiError(event, 404, "not_found", "Obat not found");
    }

    return sendSuccess(event, deleted);
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
