import Poli from "~/server/models/Poli";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const poli = await Poli.create(body);
  return { data: poli };
});
