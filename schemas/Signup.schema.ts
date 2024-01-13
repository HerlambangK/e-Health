import { z } from "h3-zod";

export default z
  .object({
    name: z.string().min(3).max(50),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(3)
      .max(50),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });
