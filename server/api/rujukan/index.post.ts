import Rujukan from "~/server/models/Rujukan";
import { generateId } from "~/server/utils/generate-id";

function generateNoRujukan(): string {
  return generateId('RJK');
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const rujukan = await Rujukan.create({
    noRujukan: generateNoRujukan(),
    encounterId: body.encounterId,
    pasienId: body.pasienId,
    tipe: body.tipe || "keluar",
    dariFaskes: body.dariFaskes,
    dariFaskesKode: body.dariFaskesKode,
    dariDokter: body.dariDokter,
    tujuanFaskes: body.tujuan?.fasilitas || body.tujuanFaskes,
    tujuanFaskesKode: body.tujuan?.kode || body.tujuanFaskesKode,
    tujuanSpesialis: body.tujuan?.spesialis || body.tujuanSpesialis,
    poliTujuan: body.poliTujuan,
    diagnosisRujukan: body.diagnosisRujukan || body.diagnosa,
    alasanRujukan: body.alasanRujukan || body.alasan,
    ringkasanKlinis: body.ringkasanKlinis,
    obatDibawa: body.obatDibawa,
    noSuratRujukan: body.noSuratRujukan,
    tanggalRujukan: body.tanggalRujukan || new Date(),
    tanggalBerlaku: body.tanggalBerlaku,
    noBPJS: body.noBPJS,
    createdBy: user?._id,
  });

  return { data: rujukan };
});
