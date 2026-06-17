import MappingConfig from "~/server/models/MappingConfig";
import { sendSuccess, sendApiError } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const config = await MappingConfig.findByIdAndDelete(id);
    if (!config) {
      return sendApiError(event, 404, "not_found", "Mapping config tidak ditemukan");
    }

    return sendSuccess(event, { deleted: true });
  } catch (error: any) {
    console.error("[MappingConfigs] DELETE error:", error);
    return sendApiError(event, 500, "server_error", "Gagal menghapus mapping config");
  }
});
