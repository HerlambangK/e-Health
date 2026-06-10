import Antrian from "~/server/models/Antrian";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = event.context.user;

  const antrian = await Antrian.create({
    ...body,
    createdBy: user?._id,
  });

  return { data: antrian };
});
