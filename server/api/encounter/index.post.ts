import Encounter from "~/server/models/Encounter";
import Antrian from "~/server/models/Antrian";
import { enqueue } from "~/server/jobs/queue";

function generateNoEncounter(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ENC-${year}-${rand}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const noEncounter = generateNoEncounter();

  const encounter = await Encounter.create({
    noEncounter,
    pasienId: body.pasienId,
    dokterId: body.dokterId,
    poliId: body.poliTujuan || body.poliId,
    tipe: body.tipe || "outpatient",
    status: "planned",
    tanggalMulai: body.tanggal || new Date(),
    jenisPembayaran: body.jenisPembayaran || "umum",
    noBPJS: body.noBPJS,
    noSEP: body.noSEP,
    keluhanUtama: body.keluhanUtama,
    anamnesis: body.anamnesis,
    createdBy: user?._id,
    updatedBy: user?._id,
  });

  if (body.buatAntrian !== false) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const count = await Antrian.countDocuments({
      poliId: encounter.poliId,
      tanggal: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    const prefix = "A";
    const nomorAntrian = `${prefix}-${String(count + 1).padStart(3, "0")}`;

    await Antrian.create({
      encounterId: encounter._id,
      pasienId: encounter.pasienId,
      poliId: encounter.poliId,
      dokterId: body.dokterId,
      nomorAntrian,
      tanggal: new Date(),
      status: "waiting",
      createdBy: user?._id,
    });
  }

  await enqueue("satusehat-sync", {
    type: "encounter",
    resourceId: encounter._id.toString(),
    action: "create",
    priority: "normal",
  });

  return { data: encounter };
});
