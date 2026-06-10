import { submitKlaim } from "~/server/integrations/bpjs/vclaim";
import { registerHandler } from "./queue";

registerHandler("bpjs-klaim", async (payload: any) => {
  await submitKlaim(payload);
});
