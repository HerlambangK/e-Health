import Resep from "~/server/models/Resep";
import { enqueue } from "~/server/jobs/queue";
import { generateId } from "~/server/utils/generate-id";

function generateNoResep(): string {
  return generateId('RX');
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

  await enqueue("satusehat-sync", {
    type: "medication",
    resourceId: resep._id.toString(),
    action: "create",
    priority: "normal",
  });

  return { data: resep };
});
