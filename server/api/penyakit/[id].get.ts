import Penyakit from "~/server/models/Penyakit";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const penyakit = await Penyakit.findById(id);

    if (!penyakit) {
      return sendApiError(event, 404, "not_found", "Penyakit not found");
    }

    return sendSuccess(event, penyakit);
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
