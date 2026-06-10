import { generateLaporanBulanan } from "~/server/integrations/sinoap/report";

export default defineTask({
  meta: { name: "sinoap-laporan", description: "Generate & submit laporan SINOAP bulanan" },
  async run() {
    const now = new Date();
    const bulan = now.getMonth();
    const tahun = now.getFullYear();

    try {
      await generateLaporanBulanan(bulan, tahun);
      return { result: `SINOAP report for ${bulan}/${tahun} submitted` };
    } catch (error: any) {
      return { result: `Failed: ${error.message}` };
    }
  },
});
