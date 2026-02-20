import Dokter from "~/server/models/Dokter";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const deleted = await Dokter.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(event, 404, "not_found", "Dokter not found");
    }

    return sendSuccess(event, deleted);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
