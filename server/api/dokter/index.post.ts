import { Validator } from "#nuxt-server-utils";
import DokterSchema from "~/schemas/Dokter.schema";
import Dokter from "~/server/models/Dokter";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(DokterSchema, body);

    const existingDokter = await Dokter.findOne({ nip: body.nip });

    if (existingDokter) {
      return sendError(event, 400, "duplicate", "NIP already exists");
    }

    const createdDokter = await Dokter.create(body);
    return sendSuccess(event, createdDokter, 201);
  } catch (error) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
