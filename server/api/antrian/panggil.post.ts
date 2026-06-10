import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const antrian = await Antrian.findByIdAndUpdate(
    body.antrianId,
    { status: "called", panggilAt: new Date() },
    { new: true }
  );

  if (!antrian) throw createError({ statusCode: 404, message: "Antrian tidak ditemukan" });

  return { data: antrian };
});
