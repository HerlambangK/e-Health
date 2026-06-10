import Rujukan from "~/server/models/Rujukan";
import Encounter from "~/server/models/Encounter";

function generateNoRujukan(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${year}-${rand}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const rujukan = await Rujukan.create({
    noRujukan: generateNoRujukan(),
    pasienId: body.pasienId,
    tipe: "masuk",
    dariFaskes: body.asal?.fasilitas || body.dariFaskes,
    dariFaskesKode: body.asal?.kode || body.dariFaskesKode,
    dariDokter: body.asal?.dokterRujuk || body.dariDokter,
    poliTujuan: body.tujuanPoli,
    diagnosisRujukan: body.diagnosisRujukan,
    noSuratRujukan: body.noSuratRujukan,
    tanggalRujukan: body.tanggalRujukan || new Date(),
    status: "active",
    createdBy: user?._id,
  });

  return { data: rujukan };
});
