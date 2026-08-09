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
    if (!body?.name) {
      return sendApiError(event, 400, "validation_error", "name is required");
    }

    const existing = await findTemplate(id);
    if (!existing) {
      return sendApiError(event, 404, "not_found", "Template not found");
    }

    const updatedTemplate: EmailTemplate = {
      ...existing,
      id,
      name: String(body.name),
      subject: body.subject ? String(body.subject) : "",
      body: getBodyFixed(body.body ? String(body.body) : ""),
      fields: body.fields && typeof body.fields === "object" ? body.fields : {},
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
