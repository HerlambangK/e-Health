import { sendError, sendSuccess } from "~/server/utils/response";
import { loadTemplates, saveTemplates } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    if (!id) {
      return sendError(event, 400, "validation_error", "Template id is required");
    }

    const templates = await loadTemplates();
    const index = templates.findIndex((item) => item.id === id);
    if (index < 0) {
      return sendError(event, 404, "not_found", "Template not found");
    }

    templates[index] = {
      ...templates[index],
      name: body.name ?? templates[index].name,
      subject: body.subject ?? templates[index].subject,
      body: body.body ?? templates[index].body,
      updatedAt: new Date().toISOString(),
    };

    await saveTemplates(templates);
    return sendSuccess(event, templates[index]);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Failed to update template");
  }
});
