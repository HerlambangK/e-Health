import Encounter from "~/server/models/Encounter";
import { enqueue } from "~/server/jobs/queue";
import { notify } from "~/server/utils/notify";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const user = event.context.user;

  const oldEncounter = await Encounter.findById(id);
  if (!oldEncounter) throw createError({ statusCode: 404, message: "Encounter tidak ditemukan" });

  const encounter = await Encounter.findByIdAndUpdate(
    id,
    { ...body, updatedBy: user?._id },
    { new: true }
  );

  if (!encounter) throw createError({ statusCode: 404, message: "Encounter tidak ditemukan" });

  if (body.status && body.status !== oldEncounter.status) {
    await notify({
      recipientId: encounter.pasienId?.toString(),
      type: 'encounter_update',
      title: 'Status Kunjungan Diperbarui',
      message: `Status kunjungan Anda berubah menjadi: ${body.status}`,
      data: { encounterId: encounter._id, status: body.status },
    });
  }

  if (body.status === "in-progress" || body.status === "finished") {
    await enqueue("satusehat-sync", {
      type: "encounter",
      resourceId: encounter._id.toString(),
      action: "update",
      priority: "normal",
    });
  }

  return { data: encounter };
});
