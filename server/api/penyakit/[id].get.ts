import Penyakit from "~/server/models/Penyakit";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const penyakit = await Penyakit.findById(id);

    if (!penyakit) {
      return sendError(event, 404, "not_found", "Penyakit not found");
    }

    return sendSuccess(event, penyakit);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
