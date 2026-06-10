import ICD10 from "~/server/models/ICD10";
import ICD9CM from "~/server/models/ICD9CM";

export async function searchICD10(query: string, limit = 10) {
  return ICD10.find(
    {
      $or: [
        { code: { $regex: query, $options: "i" } },
        { display_id: { $regex: query, $options: "i" } },
        { display_en: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    },
    { code: 1, display_id: 1, display_en: 1, _id: 0 }
  )
    .limit(limit)
    .sort({ code: 1 });
}

export async function searchICD9CM(query: string, limit = 10) {
  return ICD9CM.find(
    {
      $or: [
        { code: { $regex: query, $options: "i" } },
        { display_id: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    },
    { code: 1, display_id: 1, _id: 0 }
  )
    .limit(limit)
    .sort({ code: 1 });
}

export async function getICD10(code: string) {
  return ICD10.findOne({ code, isActive: true });
}

export async function getICD9CM(code: string) {
  return ICD9CM.findOne({ code, isActive: true });
}
