import { z } from "h3-zod";

const DokterSchema = z.object({
  namaDokter: z.string().min(3),
  nip: z.string().min(5),
  spesialisasi: z.string().min(3),
  poli: z.string().min(2),
  jadwal: z.string().min(3),
  kehadiran: z.string().min(3),
  telepon: z.string().optional(),
  email: z.string().email().optional(),
  tarifKonsultasi: z.coerce.number().optional(),
  billingCode: z.string().optional(),
  appointmentSlots: z.array(z.string()).optional(),
  catatan: z.string().optional(),
});

export default DokterSchema;
