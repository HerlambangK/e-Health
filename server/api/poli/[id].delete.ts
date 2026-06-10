import Poli from "~/server/models/Poli";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await Poli.findByIdAndUpdate(id, { isActive: false });
  return { data: { message: "Poli dinonaktifkan" } };
});
