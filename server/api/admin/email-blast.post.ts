import { Validator } from "#nuxt-server-utils";
import EmailBlastSchema from "~/schemas/EmailBlast.schema";
import { sendApiError, sendSuccess } from "~/server/utils/response";
import { createTransporter, getSenderAddress } from "~/server/utils/mailer";
import { findTemplate } from "~/server/utils/emailTemplates";
import EmailCampaign from "~/server/models/EmailCampaign";

function applyPlaceholders(value: string, payload: Record<string, string>) {
  let output = value;
  for (const [key, val] of Object.entries(payload)) {
    output = output.replaceAll(`[${key}]`, val ?? "");
  }
  return output;
}

const PARALLEL = 5;
const THROTTLE_MS = 2000;

async function runBlast(campaignId: string, recipients: any[]) {
  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) return;

  const { templateSubject, templateBody, from, testEmail } = campaign;
  const transporter = await createTransporter();

  for (let i = 0; i < recipients.length; i += PARALLEL) {
    const fresh = await EmailCampaign.findById(campaignId);
    if (!fresh || fresh.status === "cancelled") return;

    const batch = recipients.slice(i, i + PARALLEL);

    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        const payload = {
          "nama-kandidat": recipient.nama ?? "",
          lowongan: recipient.lowongan ?? "",
          username: recipient.username ?? "",
          password: recipient.password ?? "",
          email: recipient.email ?? "",
          "link-konfirmasi": recipient.linkKonfirmasi ?? "",
          "tanggal-melamar": recipient.tanggalMelamar ?? "",
          "nomor-hp": recipient.nomorHp ?? "",
          "pesan-konfirmasi": recipient.pesanKonfirmasi ?? "",
        };

        const resolvedSubject = applyPlaceholders(templateSubject || "Email Informasi", payload);
        const resolvedBody = applyPlaceholders(templateBody, payload);
        const target = testEmail || recipient.email;

        await transporter.sendMail({
          from,
          to: target,
          subject: resolvedSubject,
          text: resolvedBody,
          html: resolvedBody.replaceAll("\n", "<br />"),
        });

        return recipient.email;
      })
    );

    let batchSent = 0;
    let batchFailed = 0;
    const newFailed: Array<{ email: string; error: string }> = [];

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        batchSent++;
      } else {
        batchFailed++;
        newFailed.push({
          email: batch[j].email ?? "",
          error: result.reason?.message || "unknown error",
        });
      }
    }

    await EmailCampaign.findByIdAndUpdate(campaignId, {
      $inc: { sent: batchSent, failed: batchFailed, nextIndex: PARALLEL },
      $push: { failedList: { $each: newFailed } },
    });

    if (i + PARALLEL < recipients.length) {
      await new Promise((r) => setTimeout(r, THROTTLE_MS));
    }
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

    const { name, templateId, subject, body: templateBody, recipients, testEmail } = body as {
      name: string;
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
        linkKonfirmasi?: string;
        tanggalMelamar?: string;
        nomorHp?: string;
        pesanKonfirmasi?: string;
      }>;
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

    const validRecipients = recipients.filter((r) => {
      if (!r.email) return false;
      if (bodyTemplate.includes("[username]") && !r.username) return false;
      if (bodyTemplate.includes("[password]") && !r.password) return false;
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
      total: validRecipients.length,
      sent: 0,
      failed: 0,
      skipped: recipients.length - validRecipients.length,
      nextIndex: 0,
      failedList: [],
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
