import { Validator } from "#nuxt-server-utils";
import ObatSchema from "~/schemas/Obat.schema";
import Obat from "~/server/models/Obat";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(ObatSchema, body);

    const created = await Obat.create(body);
    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
