import { Types } from "mongoose";
import { sendApiError, sendSuccess } from "~/server/utils/response";
import EmailLog from "~/server/models/EmailLog";
import { parsePagination } from "~/server/utils/pagination";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const campaignId = query.campaignId as string;
    const status = query.status as string | undefined;
    const q = query.q as string | undefined;
    const { page, pageSize, skip } = parsePagination(query);

    if (!campaignId) {
      return sendApiError(event, 400, "missing_campaign_id", "Parameter campaignId wajib diisi.");
    }

    if (!Types.ObjectId.isValid(campaignId)) {
      return sendApiError(event, 400, "invalid_campaign_id", "Parameter campaignId tidak valid.");
    }

    const campaignObjectId = new Types.ObjectId(campaignId);

    const filter: Record<string, any> = { campaignId: campaignObjectId };
    if (status && status !== "all") {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { recipientEmail: { $regex: q, $options: "i" } },
        { recipientName: { $regex: q, $options: "i" } },
        { "recipientData.lowongan": { $regex: q, $options: "i" } },
      ];
    }

    const [items, total, stats, fieldDocs, recentLog] = await Promise.all([
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      EmailLog.countDocuments(filter),
      EmailLog.aggregate([
        { $match: { campaignId: campaignObjectId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EmailLog.aggregate([
        { $match: filter },
        { $project: { keys: { $objectToArray: "$recipientData" } } },
        { $unwind: "$keys" },
        { $group: { _id: "$keys.k" } },
      ]),
      EmailLog.findOne(filter).sort({ createdAt: -1 }).lean(),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of stats) {
      statusCounts[s._id] = s.count;
    }

    const distinctFields = new Set<string>(fieldDocs.map((f) => f._id));
    const recentOrder = Object.keys(recentLog?.recipientData || {});
    const recipientFields = [
      ...recentOrder.filter((k) => distinctFields.has(k)),
      ...[...distinctFields].filter((k) => !recentOrder.includes(k)).sort(),
    ];

    return sendSuccess(event, {
      items,
      total,
      page,
      pageSize,
      sentCount: statusCounts.sent || 0,
      failedCount: statusCounts.failed || 0,
      skippedCount: statusCounts.skipped || 0,
      recipientFields,
    });
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Gagal mengambil log email.");
  }
});
