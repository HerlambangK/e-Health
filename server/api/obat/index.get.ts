import { getQuery } from "h3";
import Obat from "~/server/models/Obat";
import { parsePagination } from "~/server/utils/pagination";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as Record<string, any>;
    const { page, pageSize, skip } = parsePagination(query);

    const filter: Record<string, any> = {};
    if (query.q) {
      const regex = new RegExp(String(query.q), "i");
      filter.$or = [{ nama: regex }, { dosis: regex }, { keterangan: regex }];
    }

    const [items, total] = await Promise.all([
      Obat.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      Obat.countDocuments(filter),
    ]);

    return sendSuccess(event, items, 200, { page, pageSize, total });
  } catch (error) {
    console.error(error);
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
