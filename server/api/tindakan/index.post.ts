import Tindakan from "~/server/models/Tindakan";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const tindakan = await Tindakan.create({
    encounterId: body.encounterId,
    pasienId: body.pasienId,
    dokterId: body.dokterId,
    kodeICD9CM: body.kodeICD9CM,
    namaICD9CM: body.namaICD9CM,
    waktu: body.waktu || new Date(),
    catatan: body.catatan,
    createdBy: user?._id,
  });

  await enqueue("satusehat-sync", {
    type: "procedure",
    resourceId: tindakan._id.toString(),
    action: "create",
    priority: "normal",
  });

  return { data: tindakan };
});
