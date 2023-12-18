import { Validator } from "#nuxt-server-utils";
import RekamedisSchema from "~/schemas/Rekamedis.schema";
import RekamMedis from "~/server/models/RekamMedis";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  Validator.validateSchema(RekamedisSchema, body);

  try {
    const createdPasien = await RekamMedis.create(body);
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
