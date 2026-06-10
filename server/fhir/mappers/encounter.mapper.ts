import type { IEncounter } from "~/server/models/Encounter";
import type { fhir4 } from "fhir";

const ENCOUNTER_CLASS_MAP: Record<string, { code: string; display: string }> = {
  outpatient: { code: "AMB", display: "ambulatory" },
  inpatient: { code: "IMP", display: "inpatient" },
  emergency: { code: "EMER", display: "emergency" },
  home_visit: { code: "HH", display: "home health" },
};

const ENCOUNTER_STATUS_MAP: Record<string, string> = {
  planned: "planned",
  arrived: "arrived",
  triaged: "triaged",
  "in-progress": "in-progress",
  onleave: "onleave",
  finished: "finished",
  cancelled: "cancelled",
};

export function toFHIREncounter(
  encounter: IEncounter,
  refs: {
    patientFhirId: string;
    doctorFhirId?: string;
    locationFhirId: string;
    orgFhirId: string;
  }
): fhir4.Encounter {
  const classCode = ENCOUNTER_CLASS_MAP[encounter.tipe] || ENCOUNTER_CLASS_MAP.outpatient;

  return {
    resourceType: "Encounter",
    id: encounter.fhirId,
    meta: {
      profile: ["https://fhir.kemkes.go.id/r4/StructureDefinition/Encounter"],
    },
    identifier: [
      {
        system: `https://fhir.kemkes.go.id/id/encounter/${refs.orgFhirId}`,
        value: encounter.noEncounter,
      },
    ],
    status: ENCOUNTER_STATUS_MAP[encounter.status] as any,
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: classCode.code,
      display: classCode.display,
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    participant: refs.doctorFhirId
      ? [
          {
            type: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                    code: "ATND",
                  },
                ],
              },
            ],
            individual: { reference: `Practitioner/${refs.doctorFhirId}` },
          },
        ]
      : [],
    period: {
      start: encounter.tanggalMulai.toISOString(),
      ...(encounter.tanggalSelesai
        ? { end: encounter.tanggalSelesai.toISOString() }
        : {}),
    },
    location: [
      {
        location: { reference: `Location/${refs.locationFhirId}` },
        status: "active",
      },
    ],
    serviceProvider: { reference: `Organization/${refs.orgFhirId}` },
  };
}
