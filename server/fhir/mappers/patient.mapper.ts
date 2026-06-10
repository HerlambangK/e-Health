import type { IPasien } from "~/server/models/Pasien";
import type { fhir4 } from "fhir";

export function toFHIRPatient(pasien: IPasien, orgId: string): fhir4.Patient {
  return {
    resourceType: "Patient",
    id: pasien.fhirId,
    meta: {
      profile: ["https://fhir.kemkes.go.id/r4/StructureDefinition/Patient"],
    },
    identifier: [
      {
        use: "official",
        system: "https://fhir.kemkes.go.id/id/nik",
        value: pasien.nik,
      },
      {
        use: "secondary",
        system: `https://fhir.kemkes.go.id/id/rekam-medis/${orgId}`,
        value: pasien.noRM,
      },
      ...(pasien.asuransi?.jenis === "BPJS" && pasien.asuransi?.nomor
        ? [
            {
              use: "official" as const,
              system: "https://fhir.kemkes.go.id/id/no-bpjs",
              value: pasien.asuransi.nomor,
            },
          ]
        : []),
    ],
    active: true,
    name: [
      {
        use: "official",
        text: pasien.nama,
      },
    ],
    telecom: [
      ...(pasien.telepon
        ? [{ system: "phone" as const, value: pasien.telepon, use: "mobile" as const }]
        : []),
      ...(pasien.email ? [{ system: "email" as const, value: pasien.email }] : []),
    ],
    gender: pasien.jenis_kelamin === "L" ? "male" : pasien.jenis_kelamin === "P" ? "female" : undefined,
    birthDate: pasien.tgl_lahir?.toISOString().split("T")[0],
    address: pasien.alamat
      ? [
          {
            use: "home" as const,
            line: [pasien.alamat.jalan],
            city: pasien.alamat.kota,
            district: pasien.alamat.kecamatan,
            state: pasien.alamat.provinsi,
            postalCode: pasien.alamat.kodePos,
            country: "ID",
          },
        ]
      : [],
    managingOrganization: {
      reference: `Organization/${orgId}`,
    },
  };
}

export function fromFHIRPatient(fhirPatient: any): Partial<IPasien> {
  return {
    fhirId: fhirPatient.id,
    nama: fhirPatient.name?.[0]?.text || "",
  };
}
