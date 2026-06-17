import MappingConfig from "~/server/models/MappingConfig";
import { sendSuccess, sendApiError } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const config = await MappingConfig.findByIdAndUpdate(
      id,
      {
        $set: {
          name: body.name?.trim(),
          mappings: body.mappings,
          columnsSnapshot: body.columnsSnapshot,
        },
      },
      { new: true }
    );

    if (!config) {
      return sendApiError(event, 404, "not_found", "Mapping config tidak ditemukan");
    }

    return sendSuccess(event, {
      id: config._id.toString(),
      name: config.name,
      mappings: config.mappings,
      columnsSnapshot: config.columnsSnapshot,
      updatedAt: config.updatedAt,
      createdAt: config.createdAt,
    });
  } catch (error: any) {
    console.error("[MappingConfigs] PUT error:", error);
    return sendApiError(event, 500, "server_error", "Gagal mengupdate mapping config");
  }
});
