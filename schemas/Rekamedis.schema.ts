import { z } from "h3-zod";

const DiagnosisEntrySchema = z.object({
  kodeICD10: z.string(),
  namaICD10: z.string(),
  status: z.enum(["confirmed", "suspected", "differential"]),
  fhirConditionId: z.string().optional(),
});

const RekamedisSchema = z.object({
  pasienId: z.string(),
  encounterId: z.string().optional(),
  dokterId: z.string().optional(),
  namaPasien: z.string(),
  dokter: z.string(),
  subjektif: z.object({
    keluhanUtama: z.string(),
    keluhan: z.string(),
    riwayatPenyakitSekarang: z.string().optional(),
    riwayatPenyakitDahulu: z.string().optional(),
    riwayatKeluarga: z.string().optional(),
    riwayatAlergi: z.string().optional(),
    riwayatObat: z.string().optional(),
  }),
  tensiSistol: z.coerce.number(),
  tensiDiastol: z.coerce.number(),
  guladarah: z.coerce.number(),
  diagnosis: z.string().optional(),
  diagnosisUtama: DiagnosisEntrySchema.optional(),
  diagnosisLain: z.array(DiagnosisEntrySchema).optional(),
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
