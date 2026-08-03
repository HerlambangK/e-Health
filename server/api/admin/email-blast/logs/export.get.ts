import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailLog from "~/server/models/EmailLog";
import EmailCampaign from "~/server/models/EmailCampaign";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const campaignId = query.campaignId as string;
    const status = query.status as string | undefined;

    if (!campaignId) {
      return sendApiError(event, 400, "missing_campaign_id", "Parameter campaignId wajib diisi.");
    }

    const campaign = await EmailCampaign.findById(campaignId).lean().select("name");
    const campaignName = campaign?.name || "Campaign";

    const filter: Record<string, any> = { campaignId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const logs = await EmailLog.find(filter).sort({ createdAt: 1 }).lean();

    const fieldOrder: string[] = [];
    const seen = new Set<string>();
    for (const log of logs) {
      for (const key of Object.keys(log.recipientData || {})) {
        if (!seen.has(key)) {
          seen.add(key);
          fieldOrder.push(key);
        }
      }
    }

    const humanize = (key: string) =>
      key
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const header = [
      "Email",
      "Nama",
      ...fieldOrder
        .filter((f) => f !== "email" && f !== "nama" && f !== "nama-kandidat")
        .map(humanize),
      "Status",
      "Error",
      "Waktu Kirim",
    ];

    const rows = logs.map((log) => [
      log.recipientEmail || "",
      log.recipientName || log.recipientData?.["nama-kandidat"] || log.recipientData?.nama || "",
      ...fieldOrder
        .filter((f) => f !== "email" && f !== "nama" && f !== "nama-kandidat")
        .map((f) => log.recipientData?.[f] || ""),
      log.status === "sent" ? "Terkirim" : log.status === "failed" ? "Gagal" : "Skip",
      log.error || "",
      log.sentAt ? new Date(log.sentAt).toLocaleString("id-ID") : log.failedAt ? new Date(log.failedAt).toLocaleString("id-ID") : "",
    ]);

    const csvContent = [
      header.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const filename = `${campaignName.replace(/[^a-zA-Z0-9]/g, "_")}_${status || "all"}_${new Date().toISOString().slice(0, 10)}.csv`;

    return sendSuccess(event, {
      filename,
      csv: csvContent,
      total: logs.length,
    });
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Gagal mengekspor log email.");
  }
});
