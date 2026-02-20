import { z } from "h3-zod";

const RekamedisSchema = z.object({
  namaPasien: z.string(),
  dokter: z.string(), // ID dokter yang berelasi
  keluhan: z.string(),
  diagnosis: z.string().optional(),
  tensiSistol: z.coerce.number(),
  tensiDiastol: z.coerce.number(),
  guladarah: z.coerce.number(),
  kontrolTerakhir: z.string(),
  followUpDate: z.string().optional(),
  labResults: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string().optional(),
      })
    )
    .optional(),
  obat: z.array(z.string()),
  catatan: z.string(),
});

export default RekamedisSchema;
