import Encounter from "~/server/models/Encounter";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const user = event.context.user;

  const encounter = await Encounter.findByIdAndUpdate(
    id,
    { ...body, updatedBy: user?._id },
    { new: true }
  );

  if (!encounter) throw createError({ statusCode: 404, message: "Encounter tidak ditemukan" });

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
