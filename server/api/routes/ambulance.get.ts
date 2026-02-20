import { sendSuccess } from "~/server/utils/response";

export default defineEventHandler((event) => {
  const stops = [
    {
      id: "start",
      name: "Dinihari Kopi, Wonosari",
      description: "Posko keberangkatan ambulans di pusat kota Wonosari.",
      coords: [-7.9602, 110.6145],
      type: "start",
      wait: 4000,
    },
    {
      id: "checkpoint-1",
      name: "Rumah Makan Bu Sudar",
      description: "Checkpoint untuk pengecekan awal kondisi pasien.",
      coords: [-7.9658, 110.6029],
      type: "checkpoint",
      wait: 2000,
    },
    {
      id: "finish",
      name: "Pantai Indrayanti",
      description: "Lokasi penjemputan pasien dan serah terima tim medis.",
      coords: [-8.151, 110.6167],
      type: "end",
      wait: 4000,
    },
  ];

  return sendSuccess(event, { stops });
});
