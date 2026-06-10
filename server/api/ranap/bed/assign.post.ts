import Bed from "~/server/models/Bed";
import Ranap from "~/server/models/Ranap";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bed = await Bed.findByIdAndUpdate(
    body.bedId,
    { status: "occupied" },
    { new: true }
  );

  if (!bed) throw createError({ statusCode: 404, message: "Bed tidak ditemukan" });

  if (body.ranapId) {
    await Ranap.findByIdAndUpdate(body.ranapId, {
      bedId: body.bedId,
      ruangan: bed.ruang,
      noKamar: body.noKamar || "",
      noBed: bed.nama,
    });
  }

  return { data: bed };
});
