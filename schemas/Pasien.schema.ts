import { z } from "h3-zod";

const PasienSchema = z.object({
  nama: z.string().min(3),
  umur: z.coerce.number().min(0),
  address: z.string().min(4),
  notlp: z.string().min(8),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  dokter: z.string().min(1), // ID dokter yang berelasi
  poli: z.string().min(1), // Nama poli yang berelasi
  jenisAsuransi: z.string().min(2),
  rekamedis: z.string().min(1), // ID rekamedis yang berelasi
  userId: z.string().optional(),
  fotoProfil: z
    .string()
    .url()
    .optional()
    .or(
      z
        .string()
        .length(0)
        .transform(() => undefined)
    ),
  riwayatPenyakit: z.array(z.string()).optional(),
  completedStatus: z.boolean().default(false),
  billingPlan: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  appointmentNotes: z.string().optional(),
});

export default PasienSchema;
