import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIRPatient(fhirPatient: fhir4.Patient): Promise<string> {
  const result = await satusehatFetch<fhir4.Patient>("/Patient", {
    method: "POST",
    body: JSON.stringify(fhirPatient),
  });
  return result.id!;
}

export async function updateFHIRPatient(fhirId: string, fhirPatient: fhir4.Patient): Promise<void> {
  await satusehatFetch(`/Patient/${fhirId}`, {
    method: "PUT",
    body: JSON.stringify({ ...fhirPatient, id: fhirId }),
  });
}

export async function searchFHIRPatientByNIK(nik: string): Promise<fhir4.Patient | null> {
  const bundle = await satusehatFetch<fhir4.Bundle>(
    `/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`
  );
  if (bundle.entry && bundle.entry.length > 0) {
    return bundle.entry[0].resource as fhir4.Patient;
  }
  return null;
}
