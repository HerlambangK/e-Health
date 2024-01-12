// import { z } from "h3-zod";
import z from "zod";

const DokterSchema = z.object({
  namaDokter: z.string(),
  nip: z.string(),
  spesialisasi: z.string(),
  poli: z.string(),
  jadwal: z.string(),
  kehadiran: z.string(),
});

export default DokterSchema;
