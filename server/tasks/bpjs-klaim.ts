import { submitKlaim } from "~/server/integrations/bpjs/vclaim";
import Billing from "~/server/models/Billing";

export default defineTask({
  meta: { name: "bpjs-klaim", description: "Submit klaim BPJS yang pending" },
  async run() {
    const pendingBills = await Billing.find({
      status: "issued",
      "jenisPembayaran": "BPJS",
      klaimSubmitted: { $ne: true },
    }).limit(50);

    let submitted = 0;
    for (const bill of pendingBills) {
      try {
        await submitKlaim({
          noSEP: bill.noSEP,
          noKartu: bill.noBPJS,
          biaya: bill.total,
          // ... mapping sesuai format VClaim
        });
        await Billing.findByIdAndUpdate(bill._id, { klaimSubmitted: true });
        submitted++;
      } catch (e) {
        // Log error, will retry next cycle
      }
    }

    return { result: `Submitted ${submitted} BPJS claims` };
  },
});
