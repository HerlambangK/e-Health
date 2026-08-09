import { sendApiError, sendSuccess } from "~/server/utils/response";
import { getBodyFixed, upsertTemplate, type EmailTemplate } from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body?.name || !body?.subject || !body?.body) {
      return sendApiError(event, 400, "validation_error", "name, subject, body are required");
    }

    const id = `tpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTemplate: EmailTemplate = {
      id,
      name: String(body.name),
      subject: String(body.subject),
      body: getBodyFixed(String(body.body)),
      fields: body.fields && typeof body.fields === "object" ? body.fields : {},
      updatedAt: new Date().toISOString(),
    };

    const templates = await upsertTemplate(newTemplate);
    const created = templates.find((tpl) => tpl.id === id) || newTemplate;

    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error("[EmailTemplates] POST error:", error);
    return sendApiError(event, 500, "server_error", "Failed to create template", {
      message: error?.message || String(error),
    });
  }
});
