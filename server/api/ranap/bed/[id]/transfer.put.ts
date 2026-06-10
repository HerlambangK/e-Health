import Bed from "~/server/models/Bed";
import Ranap from "~/server/models/Ranap";

export default defineEventHandler(async (event) => {
  const bedId = getRouterParam(event, "id");
  const body = await readBody(event);

  const newBed = await Bed.findById(body.newBedId);
  if (!newBed || newBed.status !== "available") {
    throw createError({ statusCode: 400, message: "Bed tujuan tidak tersedia" });
  }

  await Bed.findByIdAndUpdate(bedId, { status: "available" });
  await Bed.findByIdAndUpdate(body.newBedId, { status: "occupied" });

  if (body.ranapId) {
    await Ranap.findByIdAndUpdate(body.ranapId, {
      bedId: body.newBedId,
      ruangan: newBed.ruang,
      noBed: newBed.nama,
    });
  }

  return { data: newBed };
});
