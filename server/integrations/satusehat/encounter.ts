import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIREncounter(fhirEncounter: fhir4.Encounter): Promise<string> {
  const result = await satusehatFetch<fhir4.Encounter>("/Encounter", {
    method: "POST",
    body: JSON.stringify(fhirEncounter),
  });
  return result.id!;
}

export async function updateFHIREncounter(fhirId: string, fhirEncounter: fhir4.Encounter): Promise<void> {
  await satusehatFetch(`/Encounter/${fhirId}`, {
    method: "PUT",
    body: JSON.stringify({ ...fhirEncounter, id: fhirId }),
  });
}
