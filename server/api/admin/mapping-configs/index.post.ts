import MappingConfig from "~/server/models/MappingConfig";
import { sendSuccess, sendApiError } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, mappings, columnsSnapshot } = body;

    if (!name || !Array.isArray(mappings)) {
      return sendApiError(event, 400, "validation_error", "Nama dan mappings wajib diisi");
    }

    const config = await MappingConfig.create({
      name: name.trim(),
      mappings,
      columnsSnapshot: Array.isArray(columnsSnapshot) ? columnsSnapshot : [],
    });

    return sendSuccess(event, {
      id: config._id.toString(),
      name: config.name,
      mappings: config.mappings,
      columnsSnapshot: config.columnsSnapshot,
      updatedAt: config.updatedAt,
      createdAt: config.createdAt,
    });
  } catch (error: any) {
    console.error("[MappingConfigs] POST error:", error);
    return sendApiError(event, 500, "server_error", "Gagal menyimpan mapping config");
  }
});
