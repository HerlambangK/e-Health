import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIRObservation(obs: fhir4.Observation): Promise<string> {
  const result = await satusehatFetch<fhir4.Observation>("/Observation", {
    method: "POST",
    body: JSON.stringify(obs),
  });
  return result.id!;
}
