import type { ITindakan } from "~/server/models/Tindakan";
import type { fhir4 } from "fhir";

export function toFHIRProcedure(
  tindakan: ITindakan,
  refs: {
    patientFhirId: string;
    encounterFhirId: string;
    doctorFhirId: string;
  }
): fhir4.Procedure {
  return {
    resourceType: "Procedure",
    status: "completed",
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-9-cm",
          code: tindakan.kodeICD9CM,
          display: tindakan.namaICD9CM,
        },
      ],
      text: tindakan.namaICD9CM,
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    encounter: { reference: `Encounter/${refs.encounterFhirId}` },
    performedDateTime: tindakan.waktu.toISOString(),
    recorder: { reference: `Practitioner/${refs.doctorFhirId}` },
    note: tindakan.catatan
      ? [{ text: tindakan.catatan }]
      : [],
  };
}
