import { Validator } from "#nuxt-server-utils";
import PenyakitSchema from "~/schemas/Penyakit.schema";
import Penyakit from "~/server/models/Penyakit";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(PenyakitSchema, body);

    const created = await Penyakit.create(body);
    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
