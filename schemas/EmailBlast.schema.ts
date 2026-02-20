import { z } from "h3-zod";

const RecipientSchema = z.object({
  email: z.string().email(),
  nama: z.string().min(1),
  lowongan: z.string().min(1),
  username: z.string().optional(),
  password: z.string().optional(),
});

const EmailBlastSchema = z.object({
  templateId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  testEmail: z.string().email().optional(),
  recipients: z.array(RecipientSchema).min(1),
});

export default EmailBlastSchema;
