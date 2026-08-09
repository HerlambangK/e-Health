import { sendApiError, sendSuccess } from "~/server/utils/response";
import {
  findTemplate,
  getBodyFixed,
  upsertTemplate,
  type EmailTemplate,
} from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    if (!id) {
      return sendApiError(event, 400, "validation_error", "Template id is required");
    }

    const existing = await findTemplate(id);
    if (!existing) {
      return sendApiError(event, 404, "not_found", "Template not found");
    }

    const updatedTemplate: EmailTemplate = {
      ...existing,
      id,
      name:
        body?.name !== undefined && body.name !== null && String(body.name).trim() !== ""
          ? String(body.name)
          : existing.name,
      subject:
        body?.subject !== undefined && body.subject !== null
          ? String(body.subject)
          : existing.subject,
      body:
        body?.body !== undefined && body.body !== null && String(body.body).trim() !== ""
          ? getBodyFixed(String(body.body))
          : existing.body,
      fields: body?.fields && typeof body.fields === "object" ? body.fields : existing.fields || {},
      updatedAt: new Date().toISOString(),
    };

    const templates = await upsertTemplate(updatedTemplate);
    const updated = templates.find((tpl) => tpl.id === id) || updatedTemplate;

    return sendSuccess(event, updated);
  } catch (error: any) {
    console.error("[EmailTemplates] PUT error:", error);
    return sendApiError(event, 500, "server_error", "Failed to update template", {
      message: error?.message || String(error),
    });
  }
});
