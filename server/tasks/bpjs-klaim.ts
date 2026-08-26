import Billing from "~/server/models/Billing";
import { submitKlaim } from "~/server/integrations/bpjs/vclaim";
import pLimit from "p-limit";

export default defineTask({
  meta: { name: "bpjs-klaim", description: "Auto submission klaim BPJS harian" },
  async run() {
    const config = useRuntimeConfig();
    if (!config.bpjs?.consId || !config.bpjs?.secretKey) {
      return { result: "BPJS credentials not configured in .env. Skipping BPJS claim task." };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const billings = await Billing.find({
        metodePembayaran: "bpjs",
        statusPembayaran: "lunas",
        bpjsClaimStatus: { $ne: "submitted" },
        createdAt: { $gte: today },
      }).populate("pasienId").populate("encounterId");

      const limit = pLimit(3);
      await Promise.allSettled(
        billings.map(b => limit(async () => {
          try {
            await submitKlaim({
              noSep: (b as any).noSep,
              totalTagihan: b.total,
              tanggalKlaim: today.toISOString().split("T")[0],
            });
            await Billing.findByIdAndUpdate(b._id, { bpjsClaimStatus: "submitted" });
          } catch (err: any) {
            console.error(`Gagal submit klaim billing ${b._id}:`, err.message);
          }
        }))
      );

      return { result: `Submitted ${billings.length} BPJS claims` };
    } catch (err: any) {
      return { result: `BPJS claim task notice: ${err.message}` };
    }
  },
});
