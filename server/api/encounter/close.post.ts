import Encounter from "~/server/models/Encounter";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const encounter = await Encounter.findByIdAndUpdate(
    body.encounterId,
    {
      status: "finished",
      tanggalSelesai: new Date(),
      updatedBy: user?._id,
    },
    { new: true }
  );

  if (!encounter) throw createError({ statusCode: 404, message: "Encounter tidak ditemukan" });

  await enqueue("satusehat-sync", {
    type: "encounter",
    resourceId: encounter._id.toString(),
    action: "update",
    priority: "high",
  });

  return { data: encounter };
});
