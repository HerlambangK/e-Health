import type { fhir4 } from "fhir";

interface LabOrderInput {
  kode: string;
  nama: string;
  urgent: boolean;
}

export function toFHIRServiceRequest(
  order: LabOrderInput,
  refs: {
    patientFhirId: string;
    encounterFhirId: string;
    doctorFhirId: string;
  }
): fhir4.ServiceRequest {
  return {
    resourceType: "ServiceRequest",
    status: "active",
    intent: "order",
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-9-cm",
          code: order.kode,
          display: order.nama,
        },
      ],
      text: order.nama,
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    encounter: { reference: `Encounter/${refs.encounterFhirId}` },
    requester: { reference: `Practitioner/${refs.doctorFhirId}` },
    priority: order.urgent ? "urgent" : "routine",
  };
}
