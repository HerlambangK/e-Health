import { buatSEP } from "~/server/integrations/bpjs/pcare";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const data = await buatSEP({
    noKartu: body.noKartu,
    tglSep: body.tglSep,
    tglRujukan: body.tglRujukan,
    noRujukan: body.noRujukan,
    kdppk: body.kdppk,
    diagnosa: body.diagnosa,
    poli: body.poli,
    klasRawat: body.klasRawat || "R",
  });

  return { data };
});
