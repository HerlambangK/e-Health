export type Role =
  | "admin"
  | "doctor"
  | "nurse"
  | "receptionist"
  | "billing"
  | "pharmacist"
  | "patient";

export type Resource =
  | "pasien"
  | "dokter"
  | "rekamedis"
  | "appointment"
  | "billing"
  | "dashboard"
  | "obat"
  | "penyakit"
  | "routes"
  | "admin"
  | "encounter"
  | "antrian"
  | "resep"
  | "ranap"
  | "rujukan"
  | "tindakan"
  | "icd"
  | "farmasi"
  | "satusehat"
  | "sinoap";

export type Action = "create" | "read" | "update" | "delete";

const allActions: Action[] = ["create", "read", "update", "delete"];

export const ROLE_PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    pasien: allActions,
    dokter: allActions,
    rekamedis: allActions,
    appointment: allActions,
    billing: allActions,
    dashboard: ["read"],
    obat: allActions,
    penyakit: allActions,
    routes: ["read"],
    admin: allActions,
    encounter: allActions,
    antrian: allActions,
    resep: allActions,
    ranap: allActions,
    rujukan: allActions,
    tindakan: allActions,
    icd: allActions,
    farmasi: allActions,
    satusehat: allActions,
    sinoap: allActions,
  },
  doctor: {
    pasien: ["read"],
    dokter: ["read"],
    rekamedis: ["create", "read", "update"],
    appointment: ["read"],
    billing: [],
    dashboard: ["read"],
    obat: ["read"],
    penyakit: ["read"],
    routes: ["read"],
    admin: [],
    encounter: ["create", "read", "update"],
    antrian: ["read"],
    resep: ["create", "read", "update"],
    ranap: ["create", "read", "update"],
    rujukan: ["create", "read", "update"],
    tindakan: ["create", "read", "update"],
    icd: ["read"],
    farmasi: [],
    satusehat: [],
    sinoap: [],
  },
  nurse: {
    pasien: ["read"],
    dokter: ["read"],
    rekamedis: ["read", "update"],
    appointment: ["read"],
    billing: [],
    dashboard: ["read"],
    obat: ["read"],
    penyakit: ["read"],
    routes: ["read"],
    admin: [],
    encounter: ["create", "read", "update"],
    antrian: ["read"],
    resep: ["read"],
    ranap: ["create", "read", "update"],
    rujukan: ["read"],
    tindakan: ["create", "read", "update"],
    icd: ["read"],
    farmasi: [],
    satusehat: [],
    sinoap: [],
  },
  receptionist: {
    pasien: ["create", "read", "update"],
    dokter: ["read"],
    rekamedis: ["read"],
    appointment: ["create", "read", "update"],
    billing: ["read"],
    dashboard: ["read"],
    obat: ["read"],
    penyakit: ["read"],
    routes: ["read"],
    admin: [],
    encounter: ["create", "read"],
    antrian: ["create", "read", "update"],
    resep: ["read"],
    ranap: ["create", "read"],
    rujukan: ["create", "read", "update"],
    tindakan: ["read"],
    icd: ["read"],
    farmasi: [],
    satusehat: [],
    sinoap: [],
  },
  pharmacist: {
    pasien: ["read"],
    dokter: ["read"],
    rekamedis: ["read"],
    appointment: ["read"],
    billing: ["read"],
    dashboard: ["read"],
    obat: ["create", "read", "update"],
    penyakit: [],
    routes: ["read"],
    admin: [],
    encounter: ["read"],
    antrian: ["read"],
    resep: ["read", "update"],
    ranap: ["read"],
    rujukan: ["read"],
    tindakan: ["read"],
    icd: ["read"],
    farmasi: ["create", "read", "update"],
    satusehat: ["read"],
    sinoap: ["read"],
  },
  billing: {
    pasien: ["read"],
    dokter: ["read"],
    rekamedis: [],
    appointment: ["read"],
    billing: ["read", "update"],
    dashboard: ["read"],
    obat: [],
    penyakit: [],
    routes: [],
    admin: [],
    encounter: ["read"],
    antrian: ["read"],
    resep: ["read"],
    ranap: ["read"],
    rujukan: ["read"],
    tindakan: ["read"],
    icd: [],
    farmasi: [],
    satusehat: [],
    sinoap: [],
  },
  patient: {
    pasien: ["read"],
    dokter: ["read"],
    rekamedis: ["read"],
    appointment: ["read"],
    billing: ["read"],
    dashboard: ["read"],
    obat: [],
    penyakit: [],
    routes: [],
    admin: [],
    encounter: ["read"],
    antrian: ["read"],
    resep: ["read"],
    ranap: ["read"],
    rujukan: ["read"],
    tindakan: ["read"],
    icd: [],
    farmasi: [],
    satusehat: [],
    sinoap: [],
  },
};

export function hasPermission(role: Role, resource: Resource, action: Action) {
  return ROLE_PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
}

export const ROUTE_ACCESS: Array<{ pattern: RegExp; roles: Role[] }> = [
  { pattern: /^\/admin/, roles: ["admin"] },
  { pattern: /^\/dashboard/, roles: ["patient"] },
  { pattern: /^\/doctor/, roles: ["admin", "doctor", "nurse", "receptionist", "billing"] },
  {
    pattern: /^\/patient-record\/billing/,
    roles: ["admin", "billing", "receptionist", "patient"],
  },
  {
    pattern: /^\/patient-record\/appoitment/,
    roles: ["admin", "doctor", "nurse", "receptionist", "patient"],
  },
  {
    pattern: /^\/patient-record\/appointment/,
    roles: ["admin", "doctor", "nurse", "receptionist", "patient"],
  },
  {
    pattern: /^\/patient-record\/exportData/,
    roles: ["admin"],
  },
  {
    pattern: /^\/patient-record\/medical-chart/,
    roles: ["admin", "doctor", "nurse", "receptionist", "billing"],
  },
  {
    pattern: /^\/patient-record/,
    roles: ["admin", "doctor", "nurse", "receptionist", "billing"],
  },
  { pattern: /^\/map/, roles: ["admin", "doctor", "nurse", "receptionist"] },
  { pattern: /^\/pendaftaran/, roles: ["admin", "receptionist", "nurse"] },
  { pattern: /^\/poli/, roles: ["admin", "doctor", "nurse"] },
  { pattern: /^\/emr/, roles: ["admin", "doctor", "nurse"] },
  { pattern: /^\/farmasi/, roles: ["admin", "pharmacist", "nurse"] },
  { pattern: /^\/ranap/, roles: ["admin", "doctor", "nurse"] },
  { pattern: /^\/rujukan/, roles: ["admin", "doctor", "receptionist"] },
];

export function canAccessRoute(role: Role, path: string) {
  const rule = ROUTE_ACCESS.find((entry) => entry.pattern.test(path));
  if (!rule) return true;
  return rule.roles.includes(role);
}

export function normalizeRole(role?: string | null): Role {
  const candidate = (role || "patient").toLowerCase();
  if (
    candidate === "admin" ||
    candidate === "doctor" ||
    candidate === "nurse" ||
    candidate === "receptionist" ||
    candidate === "billing" ||
    candidate === "pharmacist" ||
    candidate === "patient"
  ) {
    return candidate;
  }
  return "patient";
}
