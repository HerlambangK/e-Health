import Antrian from "~/server/models/Antrian";
import { notify } from '~/server/utils/notify';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const antrian = await Antrian.findByIdAndUpdate(
    body.antrianId,
    { status: "called", panggilAt: new Date() },
    { new: true }
  );

  if (!antrian) throw createError({ statusCode: 404, message: "Antrian tidak ditemukan" });

  await notify({
    recipientId: antrian.pasienId?.toString(),
    poliId: antrian.poliId?.toString(),
    type: 'queue_call',
    title: 'Antrian Dipanggil',
    message: `Nomor antrian ${antrian.nomorAntrian} silakan menuju ${antrian.poliId}`,
    data: { antrianId: antrian._id, nomorAntrian: antrian.nomorAntrian },
    channel: 'poli',
    sendEmail: false, // Queue calls are too frequent for email
  });

  return { data: antrian };
});
