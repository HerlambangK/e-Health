import type { IResepItem } from "~/server/models/Resep";
import type { fhir4 } from "fhir";

export function toFHIRMedicationRequest(
  item: IResepItem,
  refs: {
    patientFhirId: string;
    encounterFhirId: string;
    doctorFhirId: string;
    resepId: string;
  }
): fhir4.MedicationRequest {
  return {
    resourceType: "MedicationRequest",
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: [
        {
          system: "http://sys-ids.kemkes.go.id/kfa",
          code: item.kfaCode || item.kodeObat,
          display: item.namaObat,
        },
      ],
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    encounter: { reference: `Encounter/${refs.encounterFhirId}` },
    authoredOn: new Date().toISOString().split("T")[0],
    requester: { reference: `Practitioner/${refs.doctorFhirId}` },
    dosageInstruction: [
      {
        text: `${item.dosis} ${item.rute} ${item.instruksi || ""}`.trim(),
        timing: {
          repeat: {
            frequency: 3,
            period: 1,
            periodUnit: "d",
          },
        },
        route: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: mapRouteToSnomed(item.rute),
              display: item.rute,
            },
          ],
        },
        doseAndRate: [
          {
            doseQuantity: {
              value: parseInt(item.dosis) || 1,
              unit: item.satuan,
            },
          },
        ],
      },
    ],
    dispenseRequest: {
      quantity: {
        value: item.jumlah,
        unit: item.satuan,
      },
    },
  };
}

function mapRouteToSnomed(rute: string): string {
  const map: Record<string, string> = {
    oral: "26643006",
    iv: "47625008",
    im: "78421000",
    sc: "34206005",
    topical: "6064005",
    inhalasi: "447694001",
    sublingual: "37839007",
    rektal: "6226005",
    tetes_mata: "56962002",
    tetes_telinga: "428511000",
  };
  return map[rute] || "26643006";
}
