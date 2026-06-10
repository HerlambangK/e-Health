# Implementasi SIMPRS + EMR — Roadmap

Berdasarkan `sistem_Simprs.md` dan existing codebase e-Health.

---

## Status Existing vs Target

| Area | Existing | Target (dokumen) |
|------|----------|------------------|
| **Auth & RBAC** | ✅ 6 roles | ✅+2 roles: `pharmacist`, `lab_technician`, `radiology` |
| **Pasien** | ✅ CRUD dasar | ✅+ NIK, alamat lengkap, BPJS, kontak darurat |
| **Dokter** | ✅ CRUD dasar | ✅+ SatuSehat practitioner ID |
| **Rekam Medis** | ⚠️ Sederhana (keluhan, tensi, gula, obat) | 🔄 SOAP Note lengkap, ICD-10, CPPT |
| **Appointment** | ✅ FullCalendar | ✅+ riwayat encounter |
| **Billing** | ✅ CRUD dasar | ✅+ BPJS SEP, klaim |
| **Obat** | ✅ CRUD dasar | ✅+ KFA code, golongan narkotika |
| **Penyakit** | ⚠️ CRUD sederhana | 🔄 Diganti ICD-10 |
| **Fitur Baru** | ❌ | 🆕 Encounter, Antrian, Poli, EMR Workspace, Resep, Dispensing, Ranap, Rujukan, ICD lookup, FHIR sync, SINOAP |

---

## Phase 1 — Core SIMPRS (Prioritas)

### 1A — Foundation Models
- [ ] Poli model
- [ ] Encounter model
- [ ] Antrian model
- [ ] Diagnosis model (ICD-10)
- [ ] Tindakan model (ICD-9CM)
- [ ] Resep model
- [ ] Dispensing model
- [ ] Ranap model
- [ ] Bed model
- [ ] Rujukan model
- [ ] SyncLog model
- [ ] ICD10 & ICD9CM models

### 1B — Core APIs
- [ ] `/api/encounter/**` — CRUD + close + vital-signs + cppt
- [ ] `/api/antrian/**` — CRUD + panggil + display
- [ ] `/api/poli/**` — CRUD
- [ ] `/api/diagnosis/**` — CRUD per encounter
- [ ] `/api/tindakan/**` — CRUD
- [ ] `/api/resep/**` — CRUD + dispense + antrian-farmasi
- [ ] `/api/ranap/**` — admission, discharge, bed
- [ ] `/api/rujukan/**` — CRUD + terima + surat PDF
- [ ] `/api/icd/**` — search ICD-10 & ICD-9CM

### 1C — Core Pages
- [ ] `/pendaftaran` — Loket pendaftaran
- [ ] `/pendaftaran/antrian` — Display & kelola antrian
- [ ] `/poli` — Daftar poli & pasien hari ini
- [ ] `/poli/[poliId]` — Workspace dokter per poli
- [ ] `/emr/[encounterId]` — EMR workspace (SOAP Note)
- [ ] `/farmasi` — Antrian resep
- [ ] `/farmasi/dispensing` — Dispensing obat
- [ ] `/ranap` — Dashboard rawat inap
- [ ] `/ranap/admission` — Form admisi
- [ ] `/ranap/[ranapId]` — Detail pasien ranap
- [ ] `/rujukan` — Daftar rujukan
- [ ] `/rujukan/buat` — Form rujukan

### 1D — Core Components
- [ ] `emr/SOAPNote.vue`
- [ ] `emr/DiagnosisSearch.vue` (ICD-10 autocomplete)
- [ ] `emr/TindakanSearch.vue` (ICD-9CM autocomplete)
- [ ] `emr/VitalSigns.vue`
- [ ] `emr/MedicationForm.vue`
- [ ] `antrian/AntrianDisplay.vue`
- [ ] `antrian/AntrianList.vue`
- [ ] `ranap/BedMap.vue`
- [ ] `ranap/PatientCard.vue`

---

## Phase 2 — Integrasi (Setelah Phase 1)

- [ ] FHIR client (OAuth2, SatuSehat HTTP)
- [ ] FHIR mappers (Patient, Encounter, Condition, Procedure, MedicationRequest, etc.)
- [ ] FHIR sync job & queue
- [ ] Sync status components
- [ ] BPJS P-Care (peserta, SEP)
- [ ] BPJS VClaim (klaim)
- [ ] Import ICD-10 seed data (15.000+ kode)
- [ ] Import ICD-9CM seed data (5.000+ kode)

---

## Phase 3 — Advanced

- [ ] SINOAP client & laporan bulanan
- [ ] Lab/radiology order
- [ ] E-signature dokter
- [ ] Dashboard analytics

---

## Cara Implementasi

Setiap fitur akan diimplementasikan dengan urutan:
1. **Model** → Mongoose schema
2. **API** → REST endpoints (Nitro)
3. **Page/Component** → Vue 3 + Nuxt UI
4. **RBAC** → Update permission matrix
5. **Sidebar** → Tambah navigasi

Prioritas saat ini: **Phase 1A + 1B** (models & APIs) untuk membangun fondasi.
