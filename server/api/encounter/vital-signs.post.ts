import Encounter from "~/server/models/Encounter";
import RekamMedis from "~/server/models/RekamMedis";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const rekamMedis = await RekamMedis.findOneAndUpdate(
    { encounterId: body.encounterId },
    {
      $set: {
        "objektif.ttv.tekananDarahSistolik": body.tekananDarahSistolik,
        "objektif.ttv.tekananDarahDiastolik": body.tekananDarahDiastolik,
        "objektif.ttv.nadi": body.nadi,
        "objektif.ttv.respirasi": body.respirasi,
        "objektif.ttv.suhu": body.suhu,
        "objektif.ttv.spo2": body.spo2,
        "objektif.ttv.beratBadan": body.beratBadan,
        "objektif.ttv.tinggiBadan": body.tinggiBadan,
      },
    },
    { upsert: true, new: true }
  );

  await enqueue("satusehat-sync", {
    type: "observation",
    resourceId: rekamMedis._id.toString(),
    action: "create",
    priority: "normal",
  });

  return { data: rekamMedis };
});
