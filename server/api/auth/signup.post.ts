import { Validator } from "#nuxt-server-utils";
import SignupSchema from "~/schemas/Signup.schema";
import { User } from "~/server/models/User";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    Validator.validateSchema(SignupSchema, body);
  } catch (error: any) {
    return sendError(event, 400, "validation_error", "Invalid signup data", error);
  }

  const { passwordConfirm, ...payload } = body;
  payload.email = payload.email?.trim().toLowerCase();
  payload.name = payload.name?.trim();

  const existingUser = await User.exists({ email: payload.email });

  if (existingUser) {
    return sendError(
      event,
      409,
      "duplicate",
      "Email sudah terdaftar, silakan gunakan email lain."
    );
  }

  const user = await User.create(payload);
  const userObject = user.toObject();
  delete userObject.password;

  return sendSuccess(event, userObject, 201);
});
