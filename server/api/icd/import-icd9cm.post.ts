import ICD9CM from "~/server/models/ICD9CM";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const items = Array.isArray(body) ? body : body.items;

  const data = items.map((item: any) => ({
    ...item,
    searchText: `${item.code} ${item.display_id} ${item.display_en || ""}`.toLowerCase(),
  }));

  await ICD9CM.insertMany(data, { ordered: false });

  return { data: { imported: data.length } };
});
