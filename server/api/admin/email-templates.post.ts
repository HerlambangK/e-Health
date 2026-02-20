import { sendError, sendSuccess } from "~/server/utils/response";
import { loadTemplates, saveTemplates, type EmailTemplate } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body?.name || !body?.subject || !body?.body) {
      return sendError(event, 400, "validation_error", "name, subject, body are required");
    }

    const templates = await loadTemplates();
    const newTemplate: EmailTemplate = {
      id: `tpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: String(body.name),
      subject: String(body.subject),
      body: String(body.body),
      updatedAt: new Date().toISOString(),
    };

    templates.push(newTemplate);
    await saveTemplates(templates);

    return sendSuccess(event, newTemplate, 201);
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Failed to create template");
  }
});
