import { getPesertaBPJS } from "~/server/integrations/bpjs/pcare";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const noBPJS = (query.noBPJS as string) || getRouterParam(event, "noBPJS");

  if (!noBPJS) throw createError({ statusCode: 400, message: "Nomor BPJS diperlukan" });

  const data = await getPesertaBPJS(noBPJS);
  return { data };
});
