import { Validator } from "#nuxt-server-utils";
import EmailBlastSchema from "~/schemas/EmailBlast.schema";
import { sendError, sendSuccess } from "~/server/utils/response";
import { createTransporter, getSenderAddress } from "~/server/utils/mailer";
import { findTemplate } from "~/server/utils/emailTemplates";

function applyPlaceholders(value: string, payload: Record<string, string>) {
  let output = value;
  for (const [key, val] of Object.entries(payload)) {
    output = output.replaceAll(`[${key}]`, val ?? "");
  }
  return output;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(EmailBlastSchema, body);

    const { templateId, subject, body: templateBody, recipients, testEmail } = body as {
      templateId?: string;
      subject?: string;
      body: string;
      testEmail?: string;
      recipients: Array<{
        email: string;
        nama: string;
        lowongan: string;
        username?: string;
        password?: string;
      }>;
    };

    let subjectTemplate = subject || "";
    let bodyTemplate = templateBody;

    if (templateId) {
      const tpl = await findTemplate(templateId);
      if (tpl) {
        subjectTemplate = subject || tpl.subject;
        bodyTemplate = templateBody || tpl.body;
      }
    }

    if (!bodyTemplate) {
      return sendError(event, 400, "validation_error", "Template body is required");
    }

    const transporter = await createTransporter();
    const from = getSenderAddress();

    let sent = 0;
    let skipped = 0;
    const failed: Array<{ email: string; error: string }> = [];

    for (const recipient of recipients) {
      if (!recipient.email) {
        skipped += 1;
        continue;
      }

      const payload = {
        "nama-kandidat": recipient.nama ?? "",
        lowongan: recipient.lowongan ?? "",
        username: recipient.username ?? "",
        password: recipient.password ?? "",
        email: recipient.email ?? "",
      };

      if (bodyTemplate.includes("[username]") && !payload.username) {
        skipped += 1;
        continue;
      }
      if (bodyTemplate.includes("[password]") && !payload.password) {
        skipped += 1;
        continue;
      }

      const resolvedSubject = applyPlaceholders(subjectTemplate || "Email Informasi", payload);
      const resolvedBody = applyPlaceholders(bodyTemplate, payload);

      const target = testEmail || recipient.email;

      try {
        await transporter.sendMail({
          from,
          to: target,
          subject: resolvedSubject,
          text: resolvedBody,
          html: resolvedBody.replaceAll("\n", "<br />"),
        });
        sent += 1;
      } catch (error: any) {
        failed.push({
          email: recipient.email,
          error: error?.message || "failed to send",
        });
      }
    }

    return sendSuccess(event, {
      total: recipients.length,
      sent,
      skipped,
      failed,
      testEmail: testEmail || null,
    });
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid payload", error);
  }
});
