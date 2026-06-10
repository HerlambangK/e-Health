import type { fhir4 } from "fhir";

interface VitalSignInput {
  code: string;
  loinc: string;
  value: number;
  unit: string;
  effectiveDateTime: string;
}

export function toFHIRObservation(
  vital: VitalSignInput,
  refs: {
    patientFhirId: string;
    encounterFhirId: string;
  }
): fhir4.Observation {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: vital.loinc,
          display: vital.code,
        },
      ],
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    encounter: { reference: `Encounter/${refs.encounterFhirId}` },
    effectiveDateTime: vital.effectiveDateTime,
    valueQuantity: {
      value: vital.value,
      unit: vital.unit,
      system: "http://unitsofmeasure.org",
      code: vital.unit,
    },
  };
}

export const VITAL_SIGNS_MAP = {
  tekananDarahSistolik: { loinc: "8480-6", unit: "mmHg" },
  tekananDarahDiastolik: { loinc: "8462-4", unit: "mmHg" },
  nadi: { loinc: "8867-4", unit: "/min" },
  respirasi: { loinc: "9279-1", unit: "/min" },
  suhu: { loinc: "8310-5", unit: "°C" },
  spo2: { loinc: "2708-6", unit: "%" },
  beratBadan: { loinc: "29463-7", unit: "kg" },
  tinggiBadan: { loinc: "8302-2", unit: "cm" },
};
