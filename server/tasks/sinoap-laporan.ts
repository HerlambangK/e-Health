import { sinoAPFetch } from "~/server/integrations/sinoap/client";

export default defineTask({
  meta: { name: "sinoap-laporan", description: "Generate laporan bulanan SINOAP" },
  async run() {
    const config = useRuntimeConfig();
    if (!config.sinoap?.baseUrl || !config.sinoap?.apiKey) {
      return { result: "SINOAP credentials not configured in .env. Skipping SINOAP report task." };
    }

    try {
      const now = new Date();
      const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      await sinoAPFetch("/api/laporan/generate", {
        method: "POST",
        body: JSON.stringify({ periode, autoSubmit: true }),
      });

      return { result: `Laporan SINOAP periode ${periode} generated` };
    } catch (err: any) {
      return { result: `SINOAP report notice: ${err.message}` };
    }
  },
});
