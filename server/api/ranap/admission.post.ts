import Ranap from "~/server/models/Ranap";
import Bed from "~/server/models/Bed";
import Encounter from "~/server/models/Encounter";
import { enqueue } from "~/server/jobs/queue";
import { generateId } from "~/server/utils/generate-id";
import { notify } from "~/server/utils/notify";

function generateNoRanap(): string {
  return generateId('RNP');
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const bed = await Bed.findById(body.bedId);
  if (!bed) throw createError({ statusCode: 404, message: "Bed tidak ditemukan" });
  if (bed.status !== "available") throw createError({ statusCode: 400, message: "Bed tidak tersedia" });

  const noRanap = generateNoRanap();

  const ranap = await Ranap.create({
    noRanap,
    pasienId: body.pasienId,
    encounterId: body.encounterId,
    dpjpId: body.dpjpId || body.dokterId,
    tanggalMasuk: body.tanggalMasuk || new Date(),
    bedId: body.bedId,
    ruangan: body.ruangan || bed.ruang,
    noKamar: body.noKamar,
    noBed: body.noBed || bed.nama,
    kelasRawat: body.kelasRawat || bed.kelas,
    diagnosisMasuk: body.diagnosisMasuk,
    jenisPembayaran: body.jenisPembayaran,
    noSEP: body.noSEP,
    instruksiDpjp: body.instruksiAwal || body.instruksiDpjp,
    createdBy: user?._id,
  });

  await Bed.findByIdAndUpdate(body.bedId, { status: "occupied" });

  await Encounter.findByIdAndUpdate(body.encounterId, {
    tipe: "inpatient",
    ranapId: ranap._id,
  });

  await enqueue("satusehat-sync", {
    type: "encounter",
    resourceId: body.encounterId,
    action: "update",
    priority: "high",
  });

  await notify({
    recipientId: body.pasienId,
    recipientRole: 'nurse',
    type: 'admission',
    title: 'Pasien Baru Rawat Inap',
    message: `Pasien baru telah diadmisi ke kamar ${bed.ruang || bed.nama}`,
    data: { ranapId: ranap._id, bedId: bed._id },
    channel: 'role',
  });

  return { data: ranap };
});
