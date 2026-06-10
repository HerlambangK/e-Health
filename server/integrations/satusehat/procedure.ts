import { satusehatFetch } from "~/server/fhir/client";
import type { fhir4 } from "fhir";

export async function createFHIRProcedure(proc: fhir4.Procedure): Promise<string> {
  const result = await satusehatFetch<fhir4.Procedure>("/Procedure", {
    method: "POST",
    body: JSON.stringify(proc),
  });
  return result.id!;
}
