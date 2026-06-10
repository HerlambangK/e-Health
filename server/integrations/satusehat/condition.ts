import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIRCondition(fhirCondition: fhir4.Condition): Promise<string> {
  const result = await satusehatFetch<fhir4.Condition>("/Condition", {
    method: "POST",
    body: JSON.stringify(fhirCondition),
  });
  return result.id!;
}
