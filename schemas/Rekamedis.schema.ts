import { z } from "h3-zod";

const RekamedisSchema = z.object({
  namaPasien: z.string(),
  dokter: z.string(), // ID dokter yang berelasi
  keluhan: z.string(),
  tensiSistol: z.number(),
  tensiDiastol: z.number(),
  guladarah: z.number(),
  kontrolTerakhir: z.string(),
  obat: z.array(z.string()),
  catatan: z.string(),
});

export default RekamedisSchema;
