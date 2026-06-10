import Resep from "~/server/models/Resep";
import { enqueue } from "~/server/jobs/queue";

function generateNoResep(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RX-${year}-${rand}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const mengandungNarkotika = body.items?.some(
    (i: any) => i.golongan === "narkotika"
  );
  const mengandungPsikotropika = body.items?.some(
    (i: any) => i.golongan === "psikotropika"
  );

  const resep = await Resep.create({
    noResep: generateNoResep(),
    encounterId: body.encounterId,
    pasienId: body.pasienId,
    dokterId: body.dokterId,
    tanggalResep: body.tanggalResep || new Date(),
    items: body.items,
    catatan: body.catatan,
    mengandungNarkotika,
    mengandungPsikotropika,
    createdBy: user?._id,
  });

  for (const item of resep.items) {
    await enqueue("satusehat-sync", {
      type: "medication",
      resourceId: resep._id.toString(),
      action: "create",
      priority: "normal",
    });
  }

  return { data: resep };
});
