import MappingConfig from "~/server/models/MappingConfig";
import { sendSuccess, sendApiError } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const configs = await MappingConfig.find()
      .sort({ updatedAt: -1 })
      .lean();

    const items = configs.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      mappings: c.mappings || [],
      columnsSnapshot: c.columnsSnapshot || [],
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return sendSuccess(event, items);
  } catch (error: any) {
    console.error("[MappingConfigs] GET error:", error);
    return sendApiError(event, 500, "server_error", "Gagal mengambil mapping configs");
  }
});
