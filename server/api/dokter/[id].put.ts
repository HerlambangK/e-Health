import { Validator } from "#nuxt-server-utils";
import DokterSchema from "~/schemas/Dokter.schema";
import Dokter from "~/server/models/Dokter";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    Validator.validateSchema(DokterSchema.partial(), body);

    const updated = await Dokter.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendError(event, 404, "not_found", "Dokter not found");
    }

    return sendSuccess(event, updated);
  } catch (error) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
