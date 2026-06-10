import Resep from "~/server/models/Resep";
import Dispensing from "~/server/models/Dispensing";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const resep = await Resep.findById(body.resepId);
  if (!resep) throw createError({ statusCode: 404, message: "Resep tidak ditemukan" });
  if (resep.status === "dispensed") {
    throw createError({ statusCode: 400, message: "Resep sudah didispense" });
  }

  const dispensing = await Dispensing.create({
    resepId: body.resepId,
    encounterId: resep.encounterId,
    pasienId: resep.pasienId,
    apotekerId: user?._id || body.apotekerId,
    items: body.items.map((item: any) => ({
      resepItemIndex: item.resepItemIndex,
      obatId: item.obatId,
      namaObat: item.namaObat,
      jumlahDiberikan: item.jumlahDiberikan,
      noBatch: item.noBatch,
      expiredDate: item.expiredDate,
      golongan: item.golongan,
    })),
    waktuDispensing: body.waktuDispensing || new Date(),
  });

  resep.status = "dispensed";
  await resep.save();

  await enqueue("satusehat-sync", {
    type: "medication",
    resourceId: resep._id.toString(),
    action: "update",
    priority: "normal",
  });

  return { data: dispensing };
});
