import { Validator } from "#nuxt-server-utils";
import EmailBlastSchema from "~/schemas/EmailBlast.schema";
import { sendApiError, sendSuccess } from "~/server/utils/response";
import { createTransporter, getSenderAddress, getReplyToAddress } from "~/server/utils/mailer";
import { findTemplate } from "~/server/utils/emailTemplates";
import EmailCampaign from "~/server/models/EmailCampaign";
import EmailLog from "~/server/models/EmailLog";

function applyPlaceholders(value: string, payload: Record<string, string>) {
  let output = value;
  for (const [key, val] of Object.entries(payload)) {
    output = output.replaceAll(`[${key}]`, val ?? "");
  }
  return output;
}

const PARALLEL = 3;
const DB_INTERVAL = 10;

function isRateLimitError(error: any): boolean {
  const msg = String(error?.message || error?.response || "").toLowerCase();
  return /421|450|rate.?limit|too.?many|try.?again/i.test(msg);
}

async function runBlast(campaignId: string, recipients: any[]) {
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) return;

  const { templateSubject, templateBody, from, testEmail, noreply } = campaign;
  const transporter = await createTransporter();
  const replyToAddress = getReplyToAddress();
  const noreplyFrom = replyToAddress ? `"No-Reply SSK" <${replyToAddress}>` : undefined;
  const senderFrom = noreply ? noreplyFrom || from : from;
  const replyTo = noreply ? replyToAddress : undefined;

  let batchCount = 0;
  let accSent = 0;
  let accFailed = 0;
  let accNextIndex = 0;
  let consecutiveRateLimited = 0;
  const logBatch: Array<{
    campaignId: string;
    recipientEmail: string;
    recipientName: string;
    recipientData: Record<string, any>;
    subject: string;
    body: string;
    status: "sent" | "failed";
    error: string | null;
    sentAt: Date | null;
    failedAt: Date | null;
  }> = [];

  for (let i = 0; i < recipients.length; i += PARALLEL) {
    if (batchCount % 5 === 0) {
      const fresh = await EmailCampaign.findById(campaignId);
      if (!fresh || fresh.status === "cancelled") return;
    }

    const batch = recipients.slice(i, i + PARALLEL);
    const now = new Date();

      const results = await Promise.allSettled(
        batch.map(async (recipient: Record<string, string>) => {
          const payload: Record<string, string> = {};
          for (const [key, val] of Object.entries(recipient)) {
            payload[key] = val ?? "";
          }

          const resolvedSubject = applyPlaceholders(templateSubject || "Email Informasi", payload);
          const resolvedBody = applyPlaceholders(templateBody, payload);
          const target = testEmail || payload.email;

        await transporter.sendMail({
          from: senderFrom,
          replyTo,
          to: target,
          subject: resolvedSubject,
          text: resolvedBody,
          html: resolvedBody.replaceAll("\n", "<br />"),
        });

        return { recipient, resolvedSubject, resolvedBody };
      })
    );

    let batchSent = 0;
    let batchFailed = 0;

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const recipient = batch[j];
      const recipientData: Record<string, any> = {};
      for (const [key, val] of Object.entries(recipient)) {
        if (key !== "email") {
          recipientData[key] = val ?? "";
        }
      }

      if (result.status === "fulfilled") {
        batchSent++;
        logBatch.push({
          campaignId,
          recipientEmail: recipient.email ?? "",
          recipientName: recipient["nama-kandidat"] || recipient.nama || "",
          recipientData,
          subject: result.value.resolvedSubject,
          body: result.value.resolvedBody,
          status: "sent",
          error: null,
          sentAt: now,
          failedAt: null,
        });
      } else {
        batchFailed++;
        const payload: Record<string, string> = {};
        for (const [key, val] of Object.entries(recipient)) {
          payload[key] = val ?? "";
        }
        const resolvedSubject = applyPlaceholders(templateSubject || "Email Informasi", payload);
        const resolvedBody = applyPlaceholders(templateBody, payload);
        logBatch.push({
          campaignId,
          recipientEmail: recipient.email ?? "",
          recipientName: recipient["nama-kandidat"] || recipient.nama || "",
          recipientData,
          subject: resolvedSubject,
          body: resolvedBody,
          status: "failed",
          error: result.reason?.message || "unknown error",
          sentAt: null,
          failedAt: now,
        });
      }
    }

    if (batchSent === 0 && batchFailed > 0) {
      const allRateLimited = results.every(
        (r) => r.status === "rejected" && isRateLimitError(r.reason)
      );
      if (allRateLimited) {
        consecutiveRateLimited++;
        const backoff = Math.min(30000 * consecutiveRateLimited, 300000);
        console.warn(
          `[EmailBlast] Rate limited at ${campaign._id}, sent ${accSent}/${recipients.length}, backing off ${backoff / 1000}s`
        );
        await EmailCampaign.findByIdAndUpdate(campaignId, {
          $inc: { sent: accSent, failed: accFailed, nextIndex: accNextIndex },
        });
        if (logBatch.length > 0) {
          await EmailLog.insertMany(logBatch.splice(0));
        }
        accSent = 0;
        accFailed = 0;
        accNextIndex = 0;
        await new Promise((r) => setTimeout(r, backoff));
        i -= PARALLEL;
        continue;
      }
    }

    consecutiveRateLimited = 0;
    accSent += batchSent;
    accFailed += batchFailed;
    accNextIndex += PARALLEL;
    batchCount++;

    if (batchCount % DB_INTERVAL === 0 || i + PARALLEL >= recipients.length) {
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        $inc: { sent: accSent, failed: accFailed, nextIndex: accNextIndex },
      });
      if (logBatch.length > 0) {
        await EmailLog.insertMany(logBatch.splice(0));
      }
      accSent = 0;
      accFailed = 0;
      accNextIndex = 0;
    }
  }

  if (accSent > 0 || accFailed > 0) {
    await EmailCampaign.findByIdAndUpdate(campaignId, {
      $inc: { sent: accSent, failed: accFailed, nextIndex: accNextIndex },
    });
  }
  if (logBatch.length > 0) {
    await EmailLog.insertMany(logBatch);
  }

  await EmailCampaign.findByIdAndUpdate(campaignId, {
    status: "done",
    completedAt: new Date(),
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(EmailBlastSchema, body);

    const { name, templateId, subject, body: templateBody, recipients, testEmail, noreply } = body as {
      name: string;
      templateId?: string;
      subject?: string;
      body: string;
      testEmail?: string;
      noreply?: boolean;
      recipients: Array<Record<string, string>>;
    };

    const active = await EmailCampaign.findOne({ status: "running" });
    if (active) {
      return sendApiError(
        event,
        409,
        "campaign_running",
        `Masih ada proses blast yang berjalan: "${active.name}". Tunggu selesai atau batalkan terlebih dahulu.`
      );
    }

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
      return sendApiError(event, 400, "validation_error", "Template body is required");
    }

    const from = getSenderAddress();

    const validRecipients = recipients.filter((r: any) => {
      if (!r.email) return false;
      return true;
    });

    if (validRecipients.length === 0) {
      return sendApiError(event, 400, "no_valid_recipients", "Tidak ada penerima yang valid setelah difilter.");
    }

    const campaign = await EmailCampaign.create({
      name,
      templateSubject: subjectTemplate,
      templateBody: bodyTemplate,
      from,
      testEmail: testEmail || null,
      noreply: noreply ?? false,
      total: validRecipients.length,
      sent: 0,
      failed: 0,
      skipped: recipients.length - validRecipients.length,
      nextIndex: 0,
      status: "running",
    });

    runBlast(campaign._id.toString(), validRecipients).catch((err) => {
      console.error("[EmailBlast] Background error:", err);
      EmailCampaign.findByIdAndUpdate(campaign._id, {
        status: "done",
        completedAt: new Date(),
      }).catch(() => {});
    });

    return sendSuccess(event, {
      campaignId: campaign._id,
      name,
      total: validRecipients.length,
      skipped: recipients.length - validRecipients.length,
      status: "running",
    });
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 400, "validation_error", "Invalid payload", error);
  }
});
