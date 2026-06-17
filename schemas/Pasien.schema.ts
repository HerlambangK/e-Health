import { z } from "h3-zod";

const AlamatSchema = z.object({
  jalan: z.string(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kota: z.string(),
  provinsi: z.string(),
  kodePos: z.string().optional(),
});

const KontakDaruratSchema = z.object({
  nama: z.string(),
  hubungan: z.string(),
  telepon: z.string(),
});

const AsuransiSchema = z.object({
  jenis: z.enum(["BPJS", "umum", "asuransi", "gratis"]),
  nomor: z.string().optional(),
});

const PasienSchema = z.object({
  nama: z.string().min(3),
  umur: z.coerce.number().min(0),
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  tgl_lahir: z.string().optional(),
  nik: z.string().optional(),
  noRM: z.string().optional(),
  alamat: AlamatSchema.optional(),
  address: z.string().min(4),
  notlp: z.string().min(8),
  telepon: z.string().optional(),
  email: z.string().email().optional(),
  gol_darah: z.enum(["A", "B", "AB", "O"]).optional(),
  asuransi: AsuransiSchema.optional(),
  jenisAsuransi: z.string().min(2),
  alergi: z.array(z.string()).optional(),
  kontak_darurat: KontakDaruratSchema.optional(),
  dokter: z.string().optional(),
  poli: z.string().min(1),
  rekamedis: z.string().optional(),
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
