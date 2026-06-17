import Ranap from "~/server/models/Ranap";
import Bed from "~/server/models/Bed";
import Encounter from "~/server/models/Encounter";
import { enqueue } from "~/server/jobs/queue";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ranapId = body.ranapId;

  const ranap = await Ranap.findById(ranapId);
  if (!ranap) throw createError({ statusCode: 404, message: "Ranap tidak ditemukan" });

  const tanggalKeluar = body.tanggalKeluar || new Date();
  const losHari = Math.ceil(
    (new Date(tanggalKeluar).getTime() - ranap.tanggalMasuk.getTime()) / (1000 * 60 * 60 * 24)
  );

  ranap.status = "discharged";
  ranap.tanggalKeluar = tanggalKeluar;
  ranap.kondisiKeluar = body.kondisiKeluar;
  ranap.diagnosisKeluar = body.diagnosisKeluar;
  ranap.instruksiPulang = body.instruksiPulang;
  ranap.losHari = losHari;
  await ranap.save();

  await Bed.findByIdAndUpdate(ranap.bedId, { status: "available" });

  await Encounter.findByIdAndUpdate(ranap.encounterId, {
    status: "finished",
    tanggalSelesai: tanggalKeluar,
  });

  await enqueue("satusehat-sync", {
    type: "encounter",
    resourceId: ranap.encounterId.toString(),
    action: "update",
    priority: "high",
  });

  return { data: ranap };
});
