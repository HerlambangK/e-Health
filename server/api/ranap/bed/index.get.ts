import Bed from "~/server/models/Bed";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter: any = {};

  if (query.ruangan) filter.ruang = query.ruangan;
  if (query.kelas) filter.kelas = query.kelas;
  if (query.status) filter.status = query.status;

  const beds = await Bed.find(filter).sort({ ruang: 1, nama: 1 });

  const total = beds.length;
  const tersedia = beds.filter((b) => b.status === "available").length;

  return {
    data: {
      total,
      tersedia,
      beds,
    },
  };
});
