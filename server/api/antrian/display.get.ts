import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const poliId = query.poliId as string;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const antrian = await Antrian.find({
    ...(poliId ? { poliId } : {}),
    tanggal: { $gte: today, $lt: tomorrow },
    status: { $in: ["waiting", "called", "in_room"] },
  })
    .populate("pasienId", "nama noRM")
    .sort({ nomorAntrian: 1 });

  return { data: antrian };
});
