import type { fhir4 } from "fhir";

interface DiagnosisData {
  kodeICD10: string;
  namaICD10: string;
  status: "confirmed" | "suspected" | "differential";
  fhirConditionId?: string;
  isMain?: boolean;
}

export function toFHIRCondition(
  diagnosis: DiagnosisData,
  refs: {
    patientFhirId: string;
    encounterFhirId: string;
  }
): fhir4.Condition {
  const verificationMap: Record<string, string> = {
    confirmed: "confirmed",
    suspected: "suspected",
    differential: "differential",
  };

  return {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: verificationMap[diagnosis.status] || "confirmed",
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: "encounter-diagnosis",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: diagnosis.kodeICD10,
          display: diagnosis.namaICD10,
        },
      ],
      text: diagnosis.namaICD10,
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    encounter: { reference: `Encounter/${refs.encounterFhirId}` },
    recordedDate: new Date().toISOString().split("T")[0],
  };
}
