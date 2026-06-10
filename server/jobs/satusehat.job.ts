import Pasien from "~/server/models/Pasien";
import Encounter from "~/server/models/Encounter";
import SyncLog from "~/server/models/SyncLog";
import { toFHIRPatient } from "~/server/fhir/mappers/patient.mapper";
import {
  createFHIRPatient,
  updateFHIRPatient,
  searchFHIRPatientByNIK,
} from "~/server/integrations/satusehat/patient";
import {
  createFHIREncounter,
  updateFHIREncounter,
} from "~/server/integrations/satusehat/encounter";
import { toFHIREncounter } from "~/server/fhir/mappers/encounter.mapper";
import { registerHandler } from "./queue";

export interface SyncJob {
  type: "patient" | "encounter" | "condition" | "medication" | "observation" | "procedure";
  resourceId: string;
  action: "create" | "update";
  priority: "high" | "normal" | "low";
}

export async function processSyncJob(job: SyncJob): Promise<void> {
  const log = await SyncLog.create({
    sistem: "satusehat",
    resource: job.type,
    resourceId: job.resourceId,
    action: job.action,
    status: "pending",
  });

  try {
    switch (job.type) {
      case "patient":
        await syncPatient(job.resourceId, job.action);
        break;
      case "encounter":
        await syncEncounter(job.resourceId, job.action);
        break;
    }

    await SyncLog.findByIdAndUpdate(log._id, {
      status: "success",
      completedAt: new Date(),
    });
  } catch (error: any) {
    const retryCount = log.retryCount + 1;
    const nextRetry = new Date(Date.now() + Math.pow(2, retryCount) * 60_000);

    await SyncLog.findByIdAndUpdate(log._id, {
      status: retryCount < 5 ? "pending" : "failed",
      errorMessage: error.message,
      retryCount,
      nextRetryAt: retryCount < 5 ? nextRetry : undefined,
    });
  }
}

async function syncPatient(pasienId: string, action: string): Promise<void> {
  const pasien = await Pasien.findById(pasienId);
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const config = useRuntimeConfig();
  const orgId = config.satusehat?.orgId as string;
  const fhirPatient = toFHIRPatient(pasien, orgId);

  let fhirId: string;
  if (action === "create" || !pasien.fhirId) {
    const existing = pasien.nik ? await searchFHIRPatientByNIK(pasien.nik) : null;
    if (existing) {
      fhirId = existing.id!;
    } else {
      fhirId = await createFHIRPatient(fhirPatient);
    }
  } else {
    await updateFHIRPatient(pasien.fhirId, fhirPatient);
    fhirId = pasien.fhirId;
  }

  await Pasien.findByIdAndUpdate(pasienId, {
    fhirId,
    fhirSyncStatus: "success",
    fhirSyncAt: new Date(),
    fhirSyncError: undefined,
  });
}

async function syncEncounter(encounterId: string, action: string): Promise<void> {
  const encounter = await Encounter.findById(encounterId)
    .populate("pasienId")
    .populate("dokterId")
    .populate("poliId");
  if (!encounter) throw new Error("Encounter tidak ditemukan");

  const config = useRuntimeConfig();
  const orgId = config.satusehat?.orgId as string;

  const pasien = encounter.pasienId as any;
  const dokter = encounter.dokterId as any;
  const poli = encounter.poliId as any;

  const refs = {
    patientFhirId: pasien?.fhirId || "",
    doctorFhirId: dokter?.fhirId,
    locationFhirId: poli?.fhirLocationId || "",
    orgFhirId: orgId,
  };

  const fhirEncounter = toFHIREncounter(encounter, refs);

  let fhirId: string;
  if (action === "create" || !encounter.fhirId) {
    fhirId = await createFHIREncounter(fhirEncounter);
  } else {
    await updateFHIREncounter(encounter.fhirId, fhirEncounter);
    fhirId = encounter.fhirId;
  }

  await Encounter.findByIdAndUpdate(encounterId, {
    fhirId,
    fhirSyncStatus: "success",
    fhirSyncAt: new Date(),
    fhirSyncError: undefined,
  });
}

registerHandler("satusehat-sync", async (payload: SyncJob) => {
  await processSyncJob(payload);
});
