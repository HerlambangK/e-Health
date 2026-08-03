import { z } from "h3-zod";

const RecipientSchema = z.object({
  email: z.string(),
}).catchall(z.string().optional());

const EmailBlastSchema = z.object({
  name: z.string().min(1, "Nama campaign wajib diisi"),
  templateId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  testEmail: z.string().email().optional(),
  noreply: z.boolean().optional().default(false),
  palette: z.string().optional(),
  recipients: z.array(RecipientSchema).min(1),
});

export default EmailBlastSchema;
