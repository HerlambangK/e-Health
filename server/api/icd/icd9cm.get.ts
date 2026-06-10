import ICD9CM from "~/server/models/ICD9CM";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const q = query.q as string;
  const limit = parseInt((query.limit as string) || "10");
  const filter: any = { isActive: true };

  if (q && q.length >= 2) {
    filter.$or = [
      { code: { $regex: q, $options: "i" } },
      { display_id: { $regex: q, $options: "i" } },
    ];
  }

  const data = await ICD9CM.find(filter).limit(limit).sort({ code: 1 });
  return { data };
});
