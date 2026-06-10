import Dispensing from "~/server/models/Dispensing";
import { sinoAPFetch } from "./client";

export async function generateLaporanBulanan(bulan: number, tahun: number) {
  const dispenses = await Dispensing.find({
    createdAt: {
      $gte: new Date(tahun, bulan - 1, 1),
      $lt: new Date(tahun, bulan, 1),
    },
    "items.golongan": { $in: ["narkotika", "psikotropika"] },
  }).populate(["resepId", "pasienId"]);

  const laporanItems = dispenses.flatMap((d) =>
    d.items
      .filter((item) => ["narkotika", "psikotropika"].includes(item.golongan))
      .map((item) => ({
        noResep: (d as any).resep?.noResep,
        tanggalResep: (d as any).resep?.tanggalResep,
        namaPasien: (d as any).pasien?.nama,
        namaObat: item.namaObat,
        jumlah: item.jumlahDiberikan,
        golongan: item.golongan,
      }))
  );

  return sinoAPFetch("/laporan/bulanan", {
    method: "POST",
    body: JSON.stringify({
      fasilitasId: useRuntimeConfig().sinoap?.facilityId,
      periode: { bulan, tahun },
      items: laporanItems,
    }),
  });
}
