// import { z } from "h3-zod";
import { z } from "zod";

const PasienSchema = z.object({
  nama: z.string(),
  umur: z.number(),
  address: z.string(),
  notlp: z.string(),
  dokter: z.string(), // ID dokter yang berelasi
  poli: z.string(), // Nama poli yang berelasi
  jenisAsuransi: z.string(),
  rekamedis: z.string(), // ID rekamedis yang berelasi
  fotoProfil: z
    .string()
    .default(
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
    ),
  riwayatPenyakit: z.array(z.string()).optional(),
  completedStatus: z.boolean(),
});
export default PasienSchema;
