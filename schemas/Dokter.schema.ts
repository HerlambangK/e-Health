import { z } from "h3-zod";

const DokterSchema = z.object({
  namaDokter: z.string(),
  nip: z.string(),
  spesialisasi: z.string(),
  poli: z.string(),
});

export default DokterSchema;
