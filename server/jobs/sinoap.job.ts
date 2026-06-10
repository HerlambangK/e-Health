import { generateLaporanBulanan } from "~/server/integrations/sinoap/report";
import { registerHandler } from "./queue";

registerHandler("sinoap-laporan", async (payload: { bulan: number; tahun: number }) => {
  await generateLaporanBulanan(payload.bulan, payload.tahun);
});
