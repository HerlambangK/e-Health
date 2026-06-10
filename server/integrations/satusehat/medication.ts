import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIRMedicationRequest(req: fhir4.MedicationRequest): Promise<string> {
  const result = await satusehatFetch<fhir4.MedicationRequest>("/MedicationRequest", {
    method: "POST",
    body: JSON.stringify(req),
  });
  return result.id!;
}
