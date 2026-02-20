import Obat from "~/server/models/Obat";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const obat = await Obat.findById(id);

    if (!obat) {
      return sendError(event, 404, "not_found", "Obat not found");
    }

    return sendSuccess(event, obat);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
