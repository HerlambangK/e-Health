import { Validator } from "#nuxt-server-utils";
import RekamedisSchema from "~/schemas/Rekamedis.schema";
import RekamMedis from "~/server/models/RekamMedis";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(RekamedisSchema, body);

    const created = await RekamMedis.create(body);
    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
