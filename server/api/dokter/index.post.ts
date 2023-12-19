import { Validator } from "#nuxt-server-utils";
import DokterSchema from "~/schemas/Dokter.schema";
import Dokter from "~/server/models/Dokter";
// import { Dokter } from "~/server/models/Dokter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  Validator.validateSchema(DokterSchema, body);

  // Check if the NIP already exists
  const existingDokter = await Dokter.findOne({ nip: body.nip });

  if (existingDokter) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "NIP already exists",
      }),
    };
  }

  try {
    const createdDokter = await Dokter.create(body);
    const data = createdDokter.toObject();
    return { statusCode: 201, body: data };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid data format",
      }),
    };
  }
});
