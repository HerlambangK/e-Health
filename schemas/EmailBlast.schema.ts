import { z } from "h3-zod";

const RecipientSchema = z.object({
  email: z.string(),
  nama: z.string().min(1),
  lowongan: z.string().min(1),
  username: z.string().optional(),
  password: z.string().optional(),
  linkKonfirmasi: z.string().optional(),
  tanggalMelamar: z.string().optional(),
  nomorHp: z.string().optional(),
  pesanKonfirmasi: z.string().optional(),
});

const EmailBlastSchema = z.object({
  name: z.string().min(1, "Nama campaign wajib diisi"),
  templateId: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  testEmail: z.string().email().optional(),
  recipients: z.array(RecipientSchema).min(1),
});

export default EmailBlastSchema;
