import { z } from "h3-zod";

const ObatSchema = z.object({
  nama: z.string().min(2),
  dosis: z.string().optional(),
  keterangan: z.string().optional(),
});

export default ObatSchema;
