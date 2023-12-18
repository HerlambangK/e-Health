import { Validator } from "#nuxt-server-utils";
import PasienSchema from "~/schemas/Pasien.schema";
import Pasien from "~/server/models/Pasien";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  Validator.validateSchema(PasienSchema, body);

  try {
    const createdPasien = await Pasien.create(body);
    return { statusCode: 201, body: createdPasien };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid data format",
        message: error,
      }),
    };
  }
});
