import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.poliId) filter.poliId = query.poliId;
  if (query.tanggal) {
    const date = new Date(query.tanggal as string);
    filter.tanggal = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const antrian = await Antrian.find(filter)
    .populate("pasienId", "nama noRM nik")
    .populate("poliId", "nama kode")
    .populate("dokterId", "namaDokter")
    .sort({ nomorAntrian: 1 });

  return { data: antrian };
});
