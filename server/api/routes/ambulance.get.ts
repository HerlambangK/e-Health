import { sendSuccess } from "~/server/utils/response";

export default defineEventHandler((event) => {
  const stops = [
    {
      id: "start",
      name: "RS Jantung IHC Karawang",
      description: "Titik keberangkatan ambulans dari kawasan Podomoro Parkland Karawang.",
      coords: [-6.3182, 107.273],
      type: "start",
      wait: 4000,
    },
    {
      id: "end",
      name: "Monas",
      description: "Titik tujuan ambulans di kawasan Monumen Nasional.",
      coords: [-6.1753, 106.8269],
      type: "end",
      wait: 4000,
    },
  ];

  return sendSuccess(event, { stops });
});
