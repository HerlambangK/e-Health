import { Validator } from "#nuxt-server-utils";
import ObatSchema from "~/schemas/Obat.schema";
import Obat from "~/server/models/Obat";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    Validator.validateSchema(ObatSchema.partial(), body);

    const updated = await Obat.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendError(event, 404, "not_found", "Obat not found");
    }

    return sendSuccess(event, updated);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
