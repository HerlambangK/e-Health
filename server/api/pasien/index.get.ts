// import { defineEventHandler, readBody } from "#nuxt-server-utils";
// import { Pasien } from "~/server/models/Pasien";

import Pasien from "~/server/models/Pasien";

export default defineEventHandler(async (event) => {
  const pasien = await Pasien.find();

  if (!pasien) {
    throw createError({
      statusCode: 404,
      message: "pasien not found",
    });
  }
  // return { statusCode: 200, body: JSON.stringify(pasienList) };

  return { statusCode: 200, body: JSON.stringify(pasien) };
});
