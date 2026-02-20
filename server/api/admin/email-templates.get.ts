import { sendError, sendSuccess } from "~/server/utils/response";
import { loadTemplates } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const templates = await loadTemplates();
    return sendSuccess(event, templates);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Failed to load templates");
  }
});
