import { Validator } from "#nuxt-server-utils";
import SignupSchema from "~/schemas/Signup.schema";
import { User } from "~/server/models/User";
import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  Validator.validateSchema(SignupSchema, body);

  const { passwordConfirm, ...payload } = body;
  payload.email = payload.email?.trim().toLowerCase();
  payload.name = payload.name?.trim();

  const existingUser = await User.exists({ email: payload.email });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email sudah terdaftar, silakan gunakan email lain.",
    });
  }

  const user = await User.create(payload);
  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
});
