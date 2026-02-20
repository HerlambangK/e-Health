import { z } from "h3-zod";

const PenyakitSchema = z.object({
  nama: z.string().min(2),
  gejala: z.array(z.string()).optional(),
  deskripsi: z.string().optional(),
});

export default PenyakitSchema;
