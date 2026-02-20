import { Validator } from "#nuxt-server-utils";
import PasienSchema from "~/schemas/Pasien.schema";
import Pasien from "~/server/models/Pasien";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(PasienSchema, body);

    const createdPasien = await Pasien.create(body);
    return sendSuccess(event, createdPasien, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
