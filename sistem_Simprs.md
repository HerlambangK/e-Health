# SIMPRS & EMR — Integrasi SatuSehat FHIR, SINOAP, ICD-10/ICD-9CM

## Sistem Informasi Manajemen Rumah Sakit & Electronic Medical Record

### Berbasis Nuxt 3 · Vue 3 · MongoDB · SatuSehat FHIR R4

---

> **Versi Dokumen:** 2.0.0  
> **Terakhir Diperbarui:** 2025  
> **Stack:** Nuxt 3.9+ · Vue 3.3+ · MongoDB 7+ · SatuSehat FHIR R4 · SINOAP · ICD-10 · ICD-9CM  
> **Standar:** HL7 FHIR R4 · PMK No. 24 Tahun 2022 · PMK No. 269/MENKES/PER/III/2008

---

## Daftar Isi

1. [Gambaran Umum Integrasi](#1-gambaran-umum-integrasi)
2. [Arsitektur Sistem SIMPRS + EMR](#2-arsitektur-sistem-simprs--emr)
3. [SatuSehat FHIR R4 — Konsep & Implementasi](#3-satusehat-fhir-r4--konsep--implementasi)
4. [Integrasi SINOAP](#4-integrasi-sinoap)
5. [Integrasi ICD-10 & ICD-9CM](#5-integrasi-icd-10--icd-9cm)
6. [Role & Hak Akses (Diperluas)](#6-role--hak-akses-diperluas)
7. [Struktur Proyek (Extended)](#7-struktur-proyek-extended)
8. [Skenario Lengkap Alur Pasien](#8-skenario-lengkap-alur-pasien)
   - [8.1 Pasien Baru Datang — Rawat Jalan](#81-pasien-baru-datang--rawat-jalan)
   - [8.2 Encounter Pendaftaran & Triage](#82-encounter-pendaftaran--triage)
   - [8.3 Pemilihan Poli & Antrian](#83-pemilihan-poli--antrian)
   - [8.4 Dokter — Anamnesis, Diagnosis, Tindakan](#84-dokter--anamnesis-diagnosis-tindakan)
   - [8.5 Pemberian Obat & Resep Elektronik](#85-pemberian-obat--resep-elektronik)
   - [8.6 Rawat Inap (RAJAL → RANAP)](#86-rawat-inap-rajal--ranap)
   - [8.7 Kontrol Ulang Pasien](#87-kontrol-ulang-pasien)
   - [8.8 Rujukan Internal & Eksternal](#88-rujukan-internal--eksternal)
9. [Mongoose Models (Extended)](#9-mongoose-models-extended)
10. [API Endpoints (Extended)](#10-api-endpoints-extended)
11. [FHIR Resource Mapping](#11-fhir-resource-mapping)
12. [Implementasi SatuSehat Client](#12-implementasi-satusehat-client)
13. [Implementasi SINOAP Client](#13-implementasi-sinoap-client)
14. [Halaman & Komponen Baru](#14-halaman--komponen-baru)
15. [Alur Data End-to-End](#15-alur-data-end-to-end)
16. [Konfigurasi & Environment](#16-konfigurasi--environment)
17. [Queue & Background Job](#17-queue--background-job)
18. [Checklist Compliance PMK 24/2022](#18-checklist-compliance-pmk-242022)

---

## 1. Gambaran Umum Integrasi

### 1.1 Apa yang Diintegrasikan

| Sistem Eksternal | Kegunaan | Protokol |
|-----------------|----------|----------|
| **SatuSehat FHIR R4** | Platform nasional Kemenkes — sinkronisasi data klinis, pasien, encounter, diagnosis, obat ke pusat | REST FHIR R4, OAuth2 Client Credentials |
| **SINOAP** | Sistem Informasi Narkotika dan Obat Psikotropika — pelaporan penggunaan obat narkotika/psikotropika | REST API + SOAP legacy |
| **ICD-10** | Kode penyakit internasional — diagnosis utama & sekunder | Lookup lokal + API Kemenkes |
| **ICD-9CM** | Kode prosedur/tindakan medis | Lookup lokal |
| **P-Care BPJS** | Sistem primer BPJS — validasi peserta, sep, klaim | REST API BPJS |
| **SATU DATA NIK** | Validasi identitas pasien via NIK Dukcapil | REST API |

### 1.2 Prinsip Desain Integrasi

```
Prinsip 1: Local First, Sync Later
  → Data disimpan lokal di MongoDB dulu
  → Background job sync ke SatuSehat/SINOAP secara async
  → Sistem tetap berjalan walau koneksi eksternal putus

Prinsip 2: FHIR sebagai Bahasa Universal
  → Internal model MongoDB ↔ FHIR mapper ↔ SatuSehat
  → Tidak merombak model lama, cukup add mapper layer

Prinsip 3: Audit Trail Wajib
  → Setiap interaksi klinis dicatat dengan timestamp + user
  → Sync status: pending | sent | success | failed | retry

Prinsip 4: Fallback Graceful
  → Jika FHIR endpoint down, queue job di Redis/DB
  → Retry otomatis dengan exponential backoff
```

### 1.3 Regulasi yang Dipenuhi

- **PMK No. 24 Tahun 2022** — Rekam Medis Elektronik wajib terintegrasi SatuSehat
- **PMK No. 269/MENKES/PER/III/2008** — Standar rekam medis
- **Permenkes No. 11 Tahun 2017** — Keselamatan pasien
- **UU No. 17 Tahun 2023** — Kesehatan (pengganti UU 36/2009)
- **PP No. 28 Tahun 2024** — Turunan UU Kesehatan

---

## 2. Arsitektur Sistem SIMPRS + EMR

### 2.1 Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIMPRS + EMR                             │
│                    (Nuxt 3 / Vue 3 SPA)                         │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   PENDAFTARAN │  POLI / EMR  │   FARMASI    │    MANAJEMEN       │
│   & TRIAGE   │  (Klinis)    │   & RANAP    │    (Admin)         │
│              │              │              │                    │
│ - Registrasi │ - Anamnesis  │ - Resep      │ - Dashboard        │
│ - Antrian    │ - Diagnosis  │ - Dispensing │ - Laporan          │
│ - Verifikasi │ - Tindakan   │ - Kasir      │ - Master data      │
│   NIK/BPJS   │ - SOAP Note  │ - Stok Obat  │ - SatuSehat Sync  │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Nitro Server)                      │
│  server/api/ + server/middleware/ + server/utils/               │
├─────────────────────────────────────────────────────────────────┤
│               FHIR Mapper Layer (server/fhir/)                  │
│  Patient ↔ Encounter ↔ Condition ↔ MedicationRequest ↔ ...     │
├─────────────────────────────────────────────────────────────────┤
│              Integration Queue (server/jobs/)                    │
│  SatuSehat Job | SINOAP Job | BPJS Job | Retry Handler          │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌────────┐  ┌──────────────────┐
│ MongoDB  │  │  SatuSehat   │  │ SINOAP │  │   P-Care BPJS    │
│ (local)  │  │  FHIR R4     │  │  API   │  │   + Dukcapil     │
└──────────┘  └──────────────┘  └────────┘  └──────────────────┘
```

### 2.2 Struktur Folder Extended

```
e-Health/
├── server/
│   ├── api/
│   │   ├── auth/                    # (existing)
│   │   ├── admin/                   # (existing)
│   │   ├── appointment/             # (existing + FHIR sync)
│   │   ├── billing/                 # (existing + BPJS klaim)
│   │   ├── dokter/                  # (existing)
│   │   ├── obat/                    # (existing)
│   │   ├── pasien/                  # (existing + NIK validasi)
│   │   ├── penyakit/                # (existing → diganti ICD-10)
│   │   ├── rekamedis/               # (existing + FHIR)
│   │   │
│   │   ├── [NEW] antrian/           # Manajemen antrian poli
│   │   │   ├── index.get.ts         # Daftar antrian hari ini
│   │   │   ├── index.post.ts        # Buat antrian baru
│   │   │   ├── [id].get.ts          # Detail antrian
│   │   │   ├── [id].put.ts          # Update status antrian
│   │   │   └── panggil.post.ts      # Panggil nomor antrian
│   │   │
│   │   ├── [NEW] encounter/         # FHIR Encounter
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   └── close.post.ts        # Tutup encounter
│   │   │
│   │   ├── [NEW] ranap/             # Rawat Inap
│   │   │   ├── admission.post.ts    # Admisi pasien
│   │   │   ├── index.get.ts         # Daftar pasien ranap
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   ├── discharge.post.ts    # Discharge pasien
│   │   │   └── bed/                 # Manajemen TT
│   │   │       ├── index.get.ts
│   │   │       └── assign.post.ts
│   │   │
│   │   ├── [NEW] rujukan/           # Rujukan pasien
│   │   │   ├── index.post.ts        # Buat rujukan
│   │   │   ├── index.get.ts
│   │   │   ├── [id].get.ts
│   │   │   └── terima.post.ts       # Terima rujukan masuk
│   │   │
│   │   ├── [NEW] resep/             # Resep elektronik
│   │   │   ├── index.post.ts
│   │   │   ├── index.get.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   └── dispense.post.ts     # Dispensing farmasi
│   │   │
│   │   ├── [NEW] tindakan/          # Prosedur/tindakan ICD-9CM
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   └── [id].put.ts
│   │   │
│   │   ├── [NEW] icd/               # Lookup ICD
│   │   │   ├── icd10.get.ts         # Search ICD-10
│   │   │   └── icd9cm.get.ts        # Search ICD-9CM
│   │   │
│   │   ├── [NEW] bpjs/              # Integrasi BPJS
│   │   │   ├── peserta.get.ts       # Validasi peserta
│   │   │   ├── sep.post.ts          # Buat SEP
│   │   │   └── klaim.post.ts        # Submit klaim
│   │   │
│   │   └── [NEW] satusehat/         # SatuSehat management
│   │       ├── sync-status.get.ts   # Status sync
│   │       ├── retry.post.ts        # Retry failed sync
│   │       └── webhook.post.ts      # Webhook dari SatuSehat
│   │
│   ├── fhir/                        # [NEW] FHIR Layer
│   │   ├── client.ts                # SatuSehat HTTP client + OAuth2
│   │   ├── mappers/
│   │   │   ├── patient.mapper.ts    # Pasien ↔ FHIR Patient
│   │   │   ├── encounter.mapper.ts  # Encounter ↔ FHIR Encounter
│   │   │   ├── condition.mapper.ts  # Diagnosis ↔ FHIR Condition
│   │   │   ├── medication.mapper.ts # Obat ↔ FHIR MedicationRequest
│   │   │   ├── observation.mapper.ts# Vital Signs ↔ FHIR Observation
│   │   │   ├── procedure.mapper.ts  # Tindakan ↔ FHIR Procedure
│   │   │   └── service-request.mapper.ts # Lab/Rad order
│   │   ├── resources/
│   │   │   ├── Patient.ts
│   │   │   ├── Encounter.ts
│   │   │   ├── Condition.ts
│   │   │   ├── MedicationRequest.ts
│   │   │   ├── Observation.ts
│   │   │   ├── Procedure.ts
│   │   │   └── ServiceRequest.ts
│   │   └── validator.ts             # FHIR resource validator
│   │
│   ├── jobs/                        # [NEW] Background Jobs
│   │   ├── queue.ts                 # Job queue (in-memory + MongoDB fallback)
│   │   ├── satusehat.job.ts         # Sync ke SatuSehat
│   │   ├── sinoap.job.ts            # Lapor ke SINOAP
│   │   ├── bpjs.job.ts              # Submit BPJS
│   │   └── retry.job.ts             # Retry failed jobs
│   │
│   ├── integrations/                # [NEW] External integrations
│   │   ├── satusehat/
│   │   │   ├── auth.ts              # OAuth2 token management
│   │   │   ├── patient.ts           # FHIR Patient API calls
│   │   │   ├── encounter.ts         # FHIR Encounter API calls
│   │   │   ├── condition.ts
│   │   │   ├── medication.ts
│   │   │   ├── observation.ts
│   │   │   └── procedure.ts
│   │   ├── sinoap/
│   │   │   ├── client.ts
│   │   │   └── report.ts
│   │   └── bpjs/
│   │       ├── pcare.ts
│   │       └── vclaim.ts
│   │
│   ├── models/                      # Mongoose models (extended)
│   │   ├── User.ts                  # (existing)
│   │   ├── Pasien.ts                # (existing + SatuSehat ID)
│   │   ├── Dokter.ts                # (existing + SatuSehat practitioner ID)
│   │   ├── Encounter.ts             # [NEW]
│   │   ├── Antrian.ts               # [NEW]
│   │   ├── RekamMedis.ts            # (extended)
│   │   ├── Diagnosis.ts             # [NEW] dengan ICD-10
│   │   ├── Tindakan.ts              # [NEW] dengan ICD-9CM
│   │   ├── Resep.ts                 # [NEW] Resep elektronik
│   │   ├── Dispensing.ts            # [NEW]
│   │   ├── Ranap.ts                 # [NEW] Rawat inap
│   │   ├── Bed.ts                   # [NEW] Tempat tidur
│   │   ├── Rujukan.ts               # [NEW]
│   │   ├── SyncLog.ts               # [NEW] FHIR sync log
│   │   ├── Appointment.ts           # (existing)
│   │   ├── Billing.ts               # (existing + BPJS SEP)
│   │   ├── Obat.ts                  # (existing)
│   │   ├── ICD10.ts                 # [NEW] Master ICD-10
│   │   ├── ICD9CM.ts                # [NEW] Master ICD-9CM
│   │   └── Poli.ts                  # [NEW] Master poli/instalasi
│   │
│   └── utils/
│       ├── (existing...)
│       ├── fhir-sync.ts             # [NEW] Sync orchestrator
│       ├── icd-lookup.ts            # [NEW] ICD search helper
│       └── nik-validator.ts         # [NEW] NIK Dukcapil validator
│
├── pages/
│   ├── (existing...)
│   ├── pendaftaran/
│   │   ├── index.vue                # [NEW] Loket pendaftaran
│   │   └── antrian.vue              # [NEW] Manajemen antrian
│   ├── poli/
│   │   ├── index.vue                # [NEW] Daftar poli & pasien
│   │   └── [poliId]/
│   │       └── index.vue            # [NEW] Workspace dokter per poli
│   ├── emr/
│   │   └── [encounterId].vue        # [NEW] EMR workspace (SOAP Note)
│   ├── farmasi/
│   │   ├── index.vue                # [NEW] Antrian resep
│   │   └── dispensing.vue           # [NEW] Dispensing obat
│   ├── ranap/
│   │   ├── index.vue                # [NEW] Dashboard rawat inap
│   │   ├── admission.vue            # [NEW] Admisi pasien
│   │   └── [ranapId].vue            # [NEW] Detail pasien ranap
│   └── rujukan/
│       ├── index.vue                # [NEW] Daftar rujukan
│       └── buat.vue                 # [NEW] Form rujukan
│
└── components/
    ├── (existing...)
    ├── emr/
    │   ├── SOAPNote.vue             # [NEW] SOAP note editor
    │   ├── DiagnosisSearch.vue      # [NEW] ICD-10 autocomplete
    │   ├── TindakanSearch.vue       # [NEW] ICD-9CM autocomplete
    │   ├── VitalSigns.vue           # [NEW] Input tanda vital
    │   └── MedicationForm.vue       # [NEW] Form resep elektronik
    ├── antrian/
    │   ├── AntrianDisplay.vue       # [NEW] Display nomor antrian
    │   └── AntrianList.vue          # [NEW] List antrian poli
    ├── ranap/
    │   ├── BedMap.vue               # [NEW] Peta tempat tidur
    │   └── PatientCard.vue          # [NEW] Kartu pasien ranap
    └── satusehat/
        ├── SyncStatus.vue           # [NEW] Status sync badge
        └── SyncLog.vue              # [NEW] Log sync history
```

---

## 3. SatuSehat FHIR R4 — Konsep & Implementasi

### 3.1 Resource FHIR yang Digunakan

| FHIR Resource | Data Lokal | Kapan Dikirim |
|---------------|-----------|---------------|
| `Patient` | Pasien | Saat pasien baru didaftarkan |
| `Practitioner` | Dokter | Saat dokter baru didaftarkan |
| `Organization` | RS/Klinik | Satu kali setup |
| `Location` | Poli/Ruangan | Satu kali setup |
| `Encounter` | Kunjungan/Rawat | Saat encounter dibuat & ditutup |
| `Condition` | Diagnosis ICD-10 | Saat dokter menegakkan diagnosis |
| `Procedure` | Tindakan ICD-9CM | Saat tindakan dilakukan |
| `MedicationRequest` | Resep | Saat resep ditulis dokter |
| `MedicationDispense` | Dispensing | Saat farmasi mendispense |
| `Observation` | Tanda Vital, Lab | Saat data diinput |
| `AllergyIntolerance` | Alergi pasien | Saat alergi dicatat |
| `ServiceRequest` | Order lab/rad | Saat dokter order pemeriksaan |
| `DiagnosticReport` | Hasil lab/rad | Saat hasil masuk |
| `Composition` | Ringkasan klinis | Saat discharge |

### 3.2 OAuth2 Client Credentials Flow

```
1. POST https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken
   Body: grant_type=client_credentials
         &client_id=YOUR_CLIENT_ID
         &client_secret=YOUR_SECRET

2. Response: { access_token, expires_in, token_type }

3. Setiap request FHIR: Authorization: Bearer {access_token}

4. Token di-cache di memory / Redis, refresh sebelum expired
```

### 3.3 SatuSehat Environments

| Environment | Base URL |
|------------|----------|
| Development | `https://api-satusehat-dev.dto.kemkes.go.id` |
| Staging | `https://api-satusehat-stg.dto.kemkes.go.id` |
| Production | `https://api-satusehat.kemkes.go.id` |

### 3.4 FHIR Sync Status Model

Setiap data klinis yang perlu disync memiliki field:

```typescript
interface FHIRSyncable {
  fhirId?: string;          // ID di SatuSehat setelah berhasil
  fhirSyncStatus: 'pending' | 'sent' | 'success' | 'failed' | 'not_required';
  fhirSyncAt?: Date;        // Kapan terakhir dicoba
  fhirSyncError?: string;   // Pesan error jika gagal
  fhirSyncRetry: number;    // Berapa kali sudah retry
}
```

---

## 4. Integrasi SINOAP

### 4.1 Apa itu SINOAP

SINOAP (Sistem Informasi Narkotika dan Obat Psikotropika) adalah sistem pelaporan BPOM untuk:

- Penggunaan obat narkotika (Golongan I, II, III)
- Penggunaan psikotropika
- Pelaporan bulanan wajib

### 4.2 Data yang Dilaporkan

```
Laporan Bulanan SINOAP:
├── Identitas Fasilitas Kesehatan
├── Periode Laporan (bulan/tahun)
├── Stok Awal
├── Penerimaan (dari distributor/PBF)
├── Pengeluaran per Resep:
│   ├── Nomor Resep
│   ├── Nama Dokter + SIP
│   ├── Nama Pasien
│   ├── Nama Obat + Kode BPOM
│   ├── Jumlah
│   └── Tanggal
└── Stok Akhir
```

### 4.3 Obat yang Wajib Dilaporkan

```typescript
// server/utils/sinoap-drugs.ts
export const NARKOTIKA_CATEGORIES = ['N1', 'N2', 'N3']; // Golongan I, II, III
export const PSIKOTROPIKA_CATEGORIES = ['P1', 'P2', 'P3', 'P4'];

// Contoh obat narkotika yang umum di RS
export const COMMON_NARKOTIKA = [
  'Morfin', 'Petidin', 'Fentanil', 'Kodein', 'Tramadol'
];
```

### 4.4 Alur Pelaporan SINOAP

```
Resep ditulis dokter
  → Farmasi mendispense
    → Jika obat = narkotika/psikotropika
      → SINOAPLog.create()
        → End of month: generate laporan bulanan
          → POST /sinoap/laporan
            → Konfirmasi nomor laporan
```

---

## 5. Integrasi ICD-10 & ICD-9CM

### 5.1 ICD-10 (Kode Penyakit)

ICD-10 (International Classification of Diseases, 10th Revision) digunakan untuk:

- Diagnosis utama (Principal Diagnosis)
- Diagnosis sekunder (Secondary Diagnosis)
- Penyebab luar (External Cause)

**Struktur Kode ICD-10:**

```
A00.0
│  │
│  └── Sub-kategori (desimal)
└───── Kategori 3 karakter (huruf + 2 angka)

Contoh:
J18.9  = Pneumonia, unspecified organism
I10    = Essential (primary) hypertension
E11.9  = Type 2 diabetes mellitus without complications
K35.2  = Acute appendicitis with generalized peritonitis
```

### 5.2 ICD-9CM (Kode Prosedur/Tindakan)

ICD-9CM (Clinical Modification) digunakan untuk:

- Prosedur operasi
- Tindakan medis
- Pemeriksaan penunjang

**Contoh Kode ICD-9CM:**

```
47.09  = Appendektomi lainnya
81.54  = Total knee replacement
88.72  = Diagnostic ultrasound of heart (echocardiography)
93.89  = Injeksi atau infusi NEC
99.21  = Transfusi darah NEC
```

### 5.3 Strategi Implementasi ICD di MongoDB

```typescript
// Simpan 10.000+ kode ICD-10 & 5.000+ ICD-9CM di MongoDB
// dengan full-text search index untuk autocomplete cepat

// ICD10 Collection
{
  code: "J18.9",
  display_id: "Pneumonia, tidak spesifik organisme",
  display_en: "Pneumonia, unspecified organism",
  category: "J00-J99",   // Penyakit sistem pernapasan
  parent: "J18",
  level: 3,              // 3 = kode lengkap, 1 = chapter, 2 = kategori
  searchText: "pneumonia tidak spesifik j18.9 pneumoniae" // untuk FTS
}

// Index MongoDB
db.icd10s.createIndex({ code: 1 }, { unique: true })
db.icd10s.createIndex({ searchText: "text" })
db.icd10s.createIndex({ display_id: "text", display_en: "text", code: "text" })
```

---

## 6. Role & Hak Akses (Diperluas)

### 6.1 Role Baru

| Role | Deskripsi |
|------|-----------|
| `admin` | Akses penuh |
| `doctor` | Klinis — anamnesis, diagnosis, resep, tindakan |
| `nurse` | Klinis — triage, tanda vital, CPPT keperawatan |
| `receptionist` | Pendaftaran, antrian, appointment |
| `billing` | Kasir, billing, klaim BPJS |
| `pharmacist` | Farmasi — verifikasi & dispensing resep |
| `lab_technician` | Input hasil lab |
| `radiology` | Input hasil radiologi |
| `patient` | Lihat data sendiri |

### 6.2 Matrix Permission (Extended)

| Resource | admin | doctor | nurse | receptionist | billing | pharmacist | lab | rad | patient |
|----------|-------|--------|-------|-------------|---------|-----------|-----|-----|---------|
| pasien | CRUD | R | R | CRU | R | R | R | R | R-self |
| encounter | CRUD | CRU | CRU | CR | R | R | R | R | R-self |
| antrian | CRUD | R | R | CRUD | R | R | – | – | R-self |
| rekamedis | CRUD | CRU | RU | R | R | R | R | R | R-self |
| diagnosis | CRUD | CRU | R | – | R | R | – | – | R-self |
| tindakan | CRUD | CRU | CRU | – | R | – | – | – | R-self |
| resep | CRUD | CRU | R | – | R | RU | – | – | R-self |
| dispensing | CRUD | R | R | – | R | CRUD | – | – | R-self |
| ranap | CRUD | CRU | CRU | CR | R | – | – | – | R-self |
| rujukan | CRUD | CRU | R | CR | R | – | – | – | R-self |
| billing | CRUD | – | – | R | CRUD | – | – | – | R-self |
| obat | CRUD | R | R | – | – | CRUD | – | – | – |
| icd10 | CRUD | R | R | – | – | R | R | R | – |
| icd9cm | CRUD | R | R | – | – | R | – | – | – |
| satusehat | CRUD | – | – | – | – | – | – | – | – |
| sinoap | CRUD | – | – | – | – | R | – | – | – |

---

## 7. Struktur Proyek (Extended)

Sudah tercakup di [Bagian 2.2](#22-struktur-folder-extended). Berikut tambahan detail:

### 7.1 Halaman Baru & Route

| Route | Role | Fungsi |
|-------|------|--------|
| `/pendaftaran` | receptionist, nurse | Loket pendaftaran pasien |
| `/pendaftaran/antrian` | receptionist, nurse | Display & kelola antrian |
| `/poli` | doctor, nurse | Daftar poli & pasien hari ini |
| `/poli/:poliId` | doctor, nurse | Workspace dokter per poli |
| `/emr/:encounterId` | doctor, nurse | EMR — SOAP note editor |
| `/farmasi` | pharmacist | Antrian resep masuk |
| `/farmasi/dispensing` | pharmacist | Dispensing obat |
| `/ranap` | doctor, nurse, admin | Dashboard rawat inap |
| `/ranap/admission` | doctor, nurse | Form admisi |
| `/ranap/:ranapId` | doctor, nurse | Detail pasien ranap |
| `/rujukan` | doctor, nurse, receptionist | Daftar rujukan |
| `/rujukan/buat` | doctor, receptionist | Form buat rujukan |
| `/admin/satusehat` | admin | Monitor & kelola sync SatuSehat |
| `/admin/sinoap` | admin, pharmacist | Laporan SINOAP |
| `/admin/icd` | admin | Master data ICD-10/9CM |

---

## 8. Skenario Lengkap Alur Pasien

---

### 8.1 Pasien Baru Datang — Rawat Jalan

#### Skenario
>
> **Ny. Sari Dewi (35 tahun)** datang ke RS dengan keluhan demam 3 hari, batuk, dan sesak napas ringan. Belum pernah berobat ke RS ini sebelumnya.

#### Langkah-langkah

**LANGKAH 1 — Pasien tiba di loket pendaftaran**

```
Petugas (receptionist) membuka halaman /pendaftaran
→ Klik "Pasien Baru"
→ Scan / Input NIK: 3172034512890002
```

**LANGKAH 2 — Validasi NIK via Dukcapil**

```
Frontend: POST /api/pasien/validate-nik
Body: { nik: "3172034512890002" }

Server (server/api/pasien/validate-nik.post.ts):
  → Call Dukcapil API / SatuSehat Patient by NIK
  → Return: { nama, tgl_lahir, jenis_kelamin, alamat, ... }

Frontend auto-fill form dari response
```

**LANGKAH 3 — Registrasi Pasien Baru**

```
POST /api/pasien
Body: {
  nik: "3172034512890002",
  nama: "Sari Dewi",
  tgl_lahir: "1990-03-12",
  jenis_kelamin: "P",
  gol_darah: "O",
  alamat: { jalan: "Jl. Merdeka 10", kelurahan: "...", kecamatan: "...", kota: "Jakarta Pusat", provinsi: "DKI Jakarta" },
  telepon: "081234567890",
  email: "sari@email.com",
  asuransi: { jenis: "BPJS", nomor: "0001234567890" },
  alergi: [],
  kontak_darurat: { nama: "Budi Dewi", hubungan: "Suami", telepon: "081298765432" }
}

Server:
  → Validasi Zod
  → Generate no. RM (format: RM-YYYY-XXXXXX)
  → Pasien.create() → MongoDB
  → Enqueue job: SatuSehat Patient sync (async)
  → Response: { data: { _id, noRM: "RM-2025-000123", ... } }
```

**LANGKAH 4 — Validasi BPJS (jika peserta BPJS)**

```
POST /api/bpjs/peserta
Body: { noBPJS: "0001234567890", nik: "3172034512890002" }

→ Call P-Care BPJS: GET /peserta/noKartu/{noKartu}
→ Cek status aktif/tidak aktif
→ Return: { nama, statusPeserta, kelasRawat, puskesmas, dokterGigi }
```

---

### 8.2 Encounter Pendaftaran & Triage

#### Skenario (Lanjutan)
>
> Ny. Sari terdaftar. Petugas loket membuat encounter (kunjungan) dan mendaftarkan ke poli.

**LANGKAH 5 — Buat Encounter**

```typescript
// POST /api/encounter
Body: {
  pasienId: "ObjectId_Sari",
  tipe: "outpatient",              // outpatient | inpatient | emergency
  tanggal: "2025-07-15",
  poliTujuan: "ObjectId_PoliParu", // dipilih petugas
  dokterDituju: null,               // bisa null jika belum tahu
  jenisPembayaran: "BPJS",
  noSEP: null,                      // akan diisi setelah buat SEP BPJS
  status: "registered"
}

Server:
  → Encounter.create()
  → Buat antrian di Antrian collection
  → Enqueue job: FHIR Encounter create (status: planned)
  → Jika BPJS: buat SEP via VClaim API
```

**FHIR Encounter yang dikirim ke SatuSehat:**

```json
{
  "resourceType": "Encounter",
  "status": "planned",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "AMB",
    "display": "ambulatory"
  },
  "subject": {
    "reference": "Patient/satusehat-patient-id-sari"
  },
  "participant": [{
    "type": [{ "coding": [{ "code": "ATND" }] }],
    "individual": { "reference": "Practitioner/satusehat-doctor-id" }
  }],
  "period": { "start": "2025-07-15T08:30:00+07:00" },
  "location": [{
    "location": { "reference": "Location/satusehat-location-poli-paru" }
  }],
  "serviceProvider": {
    "reference": "Organization/satusehat-org-id-rs"
  }
}
```

**LANGKAH 6 — Antrian & Triage (Nurse)**

```
Perawat triase buka /pendaftaran/antrian
→ Pilih pasien: Ny. Sari (antrian A-012)
→ Input Tanda Vital:
   - Tekanan Darah: 120/80 mmHg
   - Nadi: 98 x/mnt
   - RR: 22 x/mnt
   - Suhu: 38.5 °C
   - SpO2: 96%
   - BB: 58 kg, TB: 160 cm

POST /api/encounter/:encounterId/vital-signs
→ Observation.create() (tanda vital)
→ Enqueue: FHIR Observation bundle ke SatuSehat
```

**FHIR Observation (Suhu Badan):**

```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [{ "coding": [{ "code": "vital-signs" }] }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "8310-5",
      "display": "Body temperature"
    }]
  },
  "subject": { "reference": "Patient/ss-patient-id" },
  "encounter": { "reference": "Encounter/ss-encounter-id" },
  "effectiveDateTime": "2025-07-15T08:45:00+07:00",
  "valueQuantity": {
    "value": 38.5,
    "unit": "°C",
    "system": "http://unitsofmeasure.org",
    "code": "Cel"
  }
}
```

---

### 8.3 Pemilihan Poli & Antrian

**LANGKAH 7 — Pilihan Poli**

Saat pendaftaran, petugas memilih poli berdasarkan keluhan:

```
Keluhan: Demam, batuk, sesak napas
→ Pilihan Poli: Poli Paru / Poli Penyakit Dalam / IGD

Sistem Rekomendasi Poli (opsional AI):
  → Keyword matching dari keluhan → saran poli
  → Petugas konfirmasi

Poli yang tersedia:
├── Poli Umum (GP)
├── Poli Penyakit Dalam (Interne)
├── Poli Paru
├── Poli Jantung (Kardiologi)
├── Poli Bedah
├── Poli Anak (Pediatri)
├── Poli Saraf (Neurologi)
├── Poli Mata (Oftalmologi)
├── Poli THT
├── Poli Kulit & Kelamin (Dermatologi)
├── Poli Kebidanan & Kandungan (ObGyn)
├── Poli Gigi & Mulut
└── IGD (Emergency)
```

**LANGKAH 8 — Nomor Antrian**

```
Antrian model:
{
  _id,
  encounterId,
  pasienId,
  poliId,
  dokterId,
  nomorAntrian: "A-012",   // A = Poli Paru, angka urut per hari per poli
  tanggal: "2025-07-15",
  status: "waiting",       // waiting | called | in_room | done | skip
  estimasiWaktu: "09:15",
  panggilAt: null,
  masukAt: null,
  selesaiAt: null
}

GET /api/antrian?poliId=xxx&tanggal=2025-07-15
→ Daftar antrian hari ini di poli tersebut

Display antrian di layar poli (realtime via SSE atau polling 30 detik)
```

---

### 8.4 Dokter — Anamnesis, Diagnosis, Tindakan

#### Skenario (Lanjutan)
>
> dr. Ahmad (dokter paru) membuka workspace poli, memanggil Ny. Sari.

**LANGKAH 9 — Dokter Panggil Pasien**

```
Dokter buka /poli/poli-paru
→ Lihat daftar antrian hari ini
→ Klik "Panggil" → Ny. Sari A-012

POST /api/antrian/:id/panggil
→ Antrian.status = 'called'
→ Trigger display antrian (SSE event)
→ Encounter.status = 'in-progress'
→ FHIR Encounter update ke 'in-progress'
```

**LANGKAH 10 — EMR Workspace**

```
Dokter buka /emr/:encounterId
→ Tampil halaman EMR dengan layout:

┌─────────────────────────────────────────────────────────────────┐
│  Ny. Sari Dewi | 35 th | RM-2025-000123 | BPJS | SEP: xxx     │
├──────────────────────────┬──────────────────────────────────────┤
│  SUBJECTIVE              │  OBJECTIVE                          │
│  Keluhan Utama:          │  Tanda Vital:                       │
│  [textarea]              │  TD: 120/80 | N: 98 | RR: 22       │
│                          │  T: 38.5°C | SpO2: 96%             │
│  Riwayat Penyakit        │                                     │
│  Sekarang: [textarea]    │  Pemeriksaan Fisik:                 │
│                          │  [textarea per sistem organ]        │
│  Riwayat Penyakit        │                                     │
│  Dahulu: [textarea]      │  Hasil Lab / Radiologi:             │
│                          │  [display jika ada]                 │
│  Riwayat Keluarga:       │                                     │
│  [textarea]              │                                     │
│  Riwayat Alergi:         │                                     │
│  [chip display]          │                                     │
├──────────────────────────┴──────────────────────────────────────┤
│  ASSESSMENT                                                     │
│  Diagnosis Utama: [ICD-10 search autocomplete]                  │
│  Diagnosis Sekunder: [ICD-10 multi-select]                      │
│  Diferensial Diagnosis: [text]                                  │
├─────────────────────────────────────────────────────────────────┤
│  PLAN                                                           │
│  Tindakan: [ICD-9CM search]                                     │
│  Resep: [medication form]                                       │
│  Pemeriksaan Penunjang: [lab/rad order]                         │
│  Instruksi: [textarea]                                          │
│  Follow-up: [date picker]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**LANGKAH 11 — Input Diagnosis ICD-10**

```
Dokter ketik "pneumonia" di diagnosis search
→ GET /api/icd/icd10?q=pneumonia&limit=10

Response:
[
  { code: "J18.9", display_id: "Pneumonia, tidak spesifik organisme" },
  { code: "J18.1", display_id: "Pneumonia lobar, tidak spesifik" },
  { code: "J12.9", display_id: "Pneumonia virus, tidak spesifik" },
  { code: "J15.9", display_id: "Pneumonia bakteri, tidak spesifik" }
]

Dokter pilih: J18.9 — Pneumonia, tidak spesifik organisme (Diagnosis Utama)
Dokter tambah: J45.9 — Asma, tidak spesifik (Diagnosis Sekunder)

POST /api/rekamedis/:id/diagnosis
Body: {
  encounterId: "...",
  diagnosisUtama: { kode: "J18.9", nama: "Pneumonia, tidak spesifik organisme", status: "confirmed" },
  diagnosisLain: [
    { kode: "J45.9", nama: "Asma, tidak spesifik", status: "suspected" }
  ]
}
```

**FHIR Condition untuk Diagnosis:**

```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active" }]
  },
  "verificationStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed" }]
  },
  "category": [{
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis" }]
  }],
  "code": {
    "coding": [{
      "system": "http://hl7.org/fhir/sid/icd-10",
      "code": "J18.9",
      "display": "Pneumonia, unspecified organism"
    }],
    "text": "Pneumonia, tidak spesifik organisme"
  },
  "subject": { "reference": "Patient/ss-patient-id" },
  "encounter": { "reference": "Encounter/ss-encounter-id" },
  "recordedDate": "2025-07-15"
}
```

**LANGKAH 12 — Input Tindakan ICD-9CM**

```
Dokter input tindakan:
→ GET /api/icd/icd9cm?q=nebulisasi

Response: [{ code: "93.94", display_id: "Inhalasi uap/aerosol" }]

Pilih: 93.94 — Nebulisasi

POST /api/tindakan
Body: {
  encounterId: "...",
  pasienId: "...",
  dokterId: "...",
  kodeICD9CM: "93.94",
  namaICD9CM: "Nebulisasi",
  waktu: "2025-07-15T10:15:00+07:00",
  catatan: "Salbutamol 2.5mg + NaCl 0.9% 2cc via nebulizer"
}
```

---

### 8.5 Pemberian Obat & Resep Elektronik

**LANGKAH 13 — Tulis Resep**

```
Dokter klik "Tambah Obat" di EMR:

POST /api/resep
Body: {
  encounterId: "...",
  pasienId: "...",
  dokterId: "...",
  tanggalResep: "2025-07-15",
  items: [
    {
      obatId: "ObjectId_Amoksisilin",
      namaObat: "Amoxicillin",
      kodeObat: "AMX500",
      bentukSediaan: "Kapsul",
      kekuatan: "500mg",
      dosis: "3 x 1 kapsul",
      rute: "oral",
      durasi: 5,      // hari
      jumlah: 15,
      instruksi: "Sesudah makan",
      golongan: "antibiotic"
    },
    {
      obatId: "ObjectId_Parasetamol",
      namaObat: "Paracetamol",
      kodeObat: "PCT500",
      bentukSediaan: "Tablet",
      kekuatan: "500mg",
      dosis: "3 x 1 tab jika demam",
      rute: "oral",
      durasi: 3,
      jumlah: 9,
      instruksi: "Jika demam",
      golongan: "analgesic"
    },
    {
      obatId: "ObjectId_Salbutamol",
      namaObat: "Salbutamol MDI",
      kodeObat: "SBT100",
      bentukSediaan: "Inhaler",
      kekuatan: "100mcg/puff",
      dosis: "2 puff jika sesak",
      rute: "inhalasi",
      durasi: 7,
      jumlah: 1,
      instruksi: "Jika sesak napas",
      golongan: "bronchodilator"
    }
  ],
  catatan: "Kontrol 5 hari lagi"
}

Server:
  → Cek interaksi obat (opsional, via DB lokal)
  → Cek alergi pasien
  → Cek stok (dari Obat collection)
  → Resep.create()
  → Update encounter status plan
  → Enqueue: FHIR MedicationRequest per item
  → Cek: ada narkotika/psikotropika? → flag SINOAP
```

**FHIR MedicationRequest:**

```json
{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "medicationCodeableConcept": {
    "coding": [{
      "system": "http://sys-ids.kemkes.go.id/kfa",
      "code": "93000177",
      "display": "Amoxicillin 500 mg Kapsul"
    }]
  },
  "subject": { "reference": "Patient/ss-patient-id" },
  "encounter": { "reference": "Encounter/ss-encounter-id" },
  "authoredOn": "2025-07-15",
  "requester": { "reference": "Practitioner/ss-doctor-id" },
  "dosageInstruction": [{
    "text": "3 x 1 kapsul sesudah makan",
    "timing": {
      "repeat": { "frequency": 3, "period": 1, "periodUnit": "d" }
    },
    "route": {
      "coding": [{ "system": "http://snomed.info/sct", "code": "26643006", "display": "Oral route" }]
    },
    "doseAndRate": [{
      "doseQuantity": { "value": 1, "unit": "kapsul" }
    }]
  }],
  "dispenseRequest": {
    "quantity": { "value": 15, "unit": "kapsul" }
  }
}
```

**LANGKAH 14 — Farmasi Dispensing**

```
Apoteker buka /farmasi
→ Lihat antrian resep masuk
→ Pilih resep Ny. Sari
→ Verifikasi resep (dosis, interaksi, alergi)
→ Siapkan obat
→ Konfirmasi dispensing

POST /api/resep/:resepId/dispense
Body: {
  apotekerId: "...",
  items: [
    { resepItemId: "...", jumlahDiberikan: 15, noObat: "LOT-2025-001", expired: "2027-03" },
    { resepItemId: "...", jumlahDiberikan: 9, noObat: "LOT-2025-002", expired: "2026-12" },
    { resepItemId: "...", jumlahDiberikan: 1, noObat: "LOT-2025-003", expired: "2027-06" }
  ],
  waktuDispensing: "2025-07-15T11:00:00+07:00"
}

Server:
  → Kurangi stok obat
  → Dispensing.create()
  → Update Resep.status = 'dispensed'
  → Enqueue: FHIR MedicationDispense
  → Jika ada narkotika: SINOAPLog.create()
```

---

### 8.6 Rawat Inap (RAJAL → RANAP)

#### Skenario Alternatif
>
> Setelah periksa, ternyata kondisi Ny. Sari memburuk (SpO2 turun ke 90%). Dokter memutuskan perlu rawat inap.

**LANGKAH 15 — Keputusan Rawat Inap**

```
Dokter klik "Rawat Inap" di EMR workspace

→ Tampil form admisi:
  - Ruangan/Kelas: Kelas II (sesuai BPJS)
  - Dokter DPJP: dr. Ahmad
  - Diagnosis Masuk: J18.9 — Pneumonia
  - Alasan Rawat Inap: [textarea]
  - Instruksi Awal: [textarea]
```

**LANGKAH 16 — Admisi Pasien**

```
POST /api/ranap/admission
Body: {
  encounterId: "...",        // encounter rawat jalan dikonversi/linked
  pasienId: "...",
  dokterId: "...",           // DPJP
  tanggalMasuk: "2025-07-15T11:30:00+07:00",
  diagnosisMasuk: "J18.9",
  kelasRawat: "II",
  ruanganTujuan: "Mawar",
  alasanRawatInap: "Pneumonia dengan penurunan saturasi",
  instruksiAwal: "O2 nasal 3 LPM, IVFD RL 20 tpm, cek DL, foto thorax"
}

Server:
  → Ranap.create()
  → Encounter tipe diupdate: 'inpatient'
  → Cari bed kosong di ruangan Mawar kelas II
  → Assign bed
  → Enqueue: FHIR Encounter update (class: IMP = inpatient)
  → Jika BPJS: update SEP jenis pelayanan menjadi rawat inap
```

**LANGKAH 17 — Manajemen Bed**

```
GET /api/ranap/bed?ruangan=Mawar&kelas=II

Response: {
  ruangan: "Mawar",
  kelas: "II",
  totalBed: 20,
  tersedia: 5,
  beds: [
    { noKamar: "M-201", noBed: "B1", status: "occupied", pasien: "..." },
    { noKamar: "M-201", noBed: "B2", status: "available" },
    ...
  ]
}

POST /api/ranap/bed/assign
Body: {
  ranapId: "...",
  bedId: "...",
  noKamar: "M-201",
  noBed: "B2"
}
```

**LANGKAH 18 — Perawatan Selama Ranap**

Selama rawat inap, dokter dan perawat mengisi CPPT:

```
CPPT = Catatan Perkembangan Pasien Terintegrasi

POST /api/rekamedis/:id/cppt
Body: {
  tanggal: "2025-07-16T07:00:00+07:00",
  petugas: { id: "...", nama: "dr. Ahmad", profesi: "dokter" },
  subyektif: "Pasien mengeluh masih demam, batuk berkurang",
  obyektif: {
    ttv: { td: "118/76", nadi: 90, rr: 20, suhu: 37.8, spo2: 97 },
    pemeriksaanFisik: "Paru: ronkhi berkurang"
  },
  analisis: "Pneumonia membaik dengan terapi",
  plan: "Lanjutkan antibiotik IV, rencanakan kultur dahak, rontgen kontrol besok"
}
```

**LANGKAH 19 — Discharge Pasien**

```
Kondisi Ny. Sari membaik setelah 4 hari. Dokter memutuskan pulang.

POST /api/ranap/:ranapId/discharge
Body: {
  tanggalKeluar: "2025-07-19T10:00:00+07:00",
  kondisiKeluar: "sembuh",   // sembuh | membaik | belum sembuh | meninggal | pulang_paksa | rujuk
  diagnosisKeluar: ["J18.9"],
  instruksiPulang: "Lanjutkan amoxicillin oral 5 hari, kontrol poli paru 1 minggu",
  obatPulang: [...]           // resep pulang
}

Server:
  → Ranap.status = 'discharged'
  → Bed.status = 'available'
  → Encounter.status = 'finished'
  → Encounter.period.end = tanggalKeluar
  → Generate resume medis (Composition FHIR)
  → Enqueue: FHIR Encounter close, Composition upload
  → Jika BPJS: kirim data klaim ranap
```

**FHIR Composition (Resume Medis):**

```json
{
  "resourceType": "Composition",
  "status": "final",
  "type": {
    "coding": [{ "system": "http://loinc.org", "code": "11490-0", "display": "Discharge summarization note" }]
  },
  "subject": { "reference": "Patient/ss-patient-id" },
  "encounter": { "reference": "Encounter/ss-encounter-id" },
  "date": "2025-07-19",
  "author": [{ "reference": "Practitioner/ss-doctor-id" }],
  "title": "Resume Medis Rawat Inap",
  "section": [
    {
      "title": "Diagnosis",
      "entry": [{ "reference": "Condition/ss-condition-id" }]
    },
    {
      "title": "Obat yang Diberikan",
      "entry": [{ "reference": "MedicationRequest/ss-med-id" }]
    }
  ]
}
```

---

### 8.7 Kontrol Ulang Pasien

**LANGKAH 20 — Buat Appointment Kontrol**

```
Saat discharge, atau pasien rawat jalan ingin kontrol:

POST /api/appointment
Body: {
  pasienId: "...",
  dokterId: "...",
  poliId: "...",
  tanggal: "2025-07-26T09:00:00+07:00",
  tipe: "kontrol",           // baru | kontrol | rujukan_balik
  encounterId: "...",        // link ke encounter sebelumnya
  catatan: "Kontrol post rawat inap pneumonia"
}

Server:
  → Cek konflik jadwal dokter
  → Appointment.create()
  → Generate reminder (email H-1)
  → Enqueue: FHIR Appointment create
```

**LANGKAH 21 — Pasien Datang Kontrol**

```
Tanggal kontrol: 25 Juli 2025

1. Petugas loket scan identitas pasien
2. Sistem deteksi otomatis: ada appointment kontrol hari ini
   → Tampil konfirmasi: "Ny. Sari — Kontrol Poli Paru — dr. Ahmad — 09:00"
3. Petugas konfirmasi → encounter baru dibuat (tipe: kontrol)
4. Antrian otomatis sesuai appointment
5. EMR workspace dokter sudah preload riwayat encounter sebelumnya
```

---

### 8.8 Rujukan Internal & Eksternal

#### Skenario Rujukan Internal
>
> Dokter paru merujuk Ny. Sari ke lab untuk pemeriksaan sputum kultur.

**LANGKAH 22 — Buat Order Lab (ServiceRequest)**

```
POST /api/tindakan/lab-order
Body: {
  encounterId: "...",
  pasienId: "...",
  dokterId: "...",
  items: [
    { kode: "88.69", nama: "Kultur Sputum + Sensitivitas Antibiotik", urgent: false }
  ],
  catatan: "Evaluasi respons antibiotik"
}

→ ServiceRequest.create()
→ Enqueue: FHIR ServiceRequest
→ Notifikasi ke lab
```

#### Skenario Rujukan Eksternal
>
> Pasien baru: Tn. Budi, dirujuk dari Puskesmas ke RS.

**LANGKAH 23 — Terima Rujukan Masuk**

```
Rujukan dari: Puskesmas Cempaka
Media: Surat rujukan fisik / digital (P-Care BPJS)

Petugas loket:
POST /api/rujukan/terima
Body: {
  asal: {
    fasilitas: "Puskesmas Cempaka",
    kode: "0101A011",
    dokterRujuk: "dr. Irma"
  },
  pasienId: "...",
  diagnosisRujukan: "K37 — Appendicitis",
  tujuanPoli: "Bedah",
  noSuratRujukan: "REF-2025-07-001",
  tanggalRujukan: "2025-07-15",
  catatan: "Keluhan nyeri perut kanan bawah 2 hari"
}

→ Rujukan.create()
→ Encounter.create() dengan flag rujukan_masuk
→ FHIR: ServiceRequest (referral)
```

**LANGKAH 24 — Buat Rujukan Keluar**

```
Dokter memutuskan Tn. Budi perlu CT-Scan yang tidak tersedia di RS ini.

POST /api/rujukan
Body: {
  tipe: "keluar",
  pasienId: "...",
  encounterId: "...",
  dokterId: "...",
  tujuan: {
    fasilitas: "RS Pusat Rujukan",
    kode: "0101B001",
    spesialis: "Bedah Digestif"
  },
  diagnosisRujukan: "K37",
  alasanRujukan: "Perlu CT-Scan abdomen + konsul bedah digestif",
  obatDibawa: [...],
  ringkasanKlinis: "...",
  tanggalBerlaku: "2025-07-20"
}

Server:
  → Rujukan.create()
  → Generate surat rujukan PDF (html2pdf.js)
  → Update Encounter.status = 'finished' (jika pasien langsung dirujuk)
  → Enqueue: FHIR Task (referral)
  → Jika BPJS: update data rujukan di P-Care
```

---

## 9. Mongoose Models (Extended)

### 9.1 Model Encounter

```typescript
// server/models/Encounter.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEncounter extends Document {
  // Identitas
  noEncounter: string;           // ENC-2025-XXXXXX
  pasienId: mongoose.Types.ObjectId;
  dokterId?: mongoose.Types.ObjectId;
  poliId: mongoose.Types.ObjectId;
  
  // Tipe & Status
  tipe: 'outpatient' | 'inpatient' | 'emergency' | 'home_visit';
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  
  // Waktu
  tanggalMulai: Date;
  tanggalSelesai?: Date;
  
  // Pembayaran
  jenisPembayaran: 'BPJS' | 'umum' | 'asuransi' | 'gratis';
  noBPJS?: string;
  noSEP?: string;
  noAsuransi?: string;
  
  // Referensi
  appointmentId?: mongoose.Types.ObjectId;
  rujukanId?: mongoose.Types.ObjectId;
  ranapId?: mongoose.Types.ObjectId;
  
  // Klinis
  keluhanUtama?: string;
  anamnesis?: string;
  
  // FHIR Sync
  fhirId?: string;
  fhirSyncStatus: 'pending' | 'sent' | 'success' | 'failed' | 'not_required';
  fhirSyncAt?: Date;
  fhirSyncError?: string;
  fhirSyncRetry: number;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const EncounterSchema = new Schema<IEncounter>({
  noEncounter: { type: String, unique: true, required: true },
  pasienId: { type: Schema.Types.ObjectId, ref: 'Pasien', required: true },
  dokterId: { type: Schema.Types.ObjectId, ref: 'Dokter' },
  poliId: { type: Schema.Types.ObjectId, ref: 'Poli', required: true },
  tipe: { type: String, enum: ['outpatient','inpatient','emergency','home_visit'], default: 'outpatient' },
  status: { type: String, enum: ['planned','arrived','triaged','in-progress','onleave','finished','cancelled'], default: 'planned' },
  tanggalMulai: { type: Date, required: true },
  tanggalSelesai: Date,
  jenisPembayaran: { type: String, enum: ['BPJS','umum','asuransi','gratis'], default: 'umum' },
  noBPJS: String,
  noSEP: String,
  noAsuransi: String,
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  rujukanId: { type: Schema.Types.ObjectId, ref: 'Rujukan' },
  ranapId: { type: Schema.Types.ObjectId, ref: 'Ranap' },
  keluhanUtama: String,
  anamnesis: String,
  fhirId: String,
  fhirSyncStatus: { type: String, enum: ['pending','sent','success','failed','not_required'], default: 'pending' },
  fhirSyncAt: Date,
  fhirSyncError: String,
  fhirSyncRetry: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

EncounterSchema.index({ pasienId: 1, tanggalMulai: -1 });
EncounterSchema.index({ poliId: 1, tanggalMulai: 1, status: 1 });
EncounterSchema.index({ fhirSyncStatus: 1 });

export default mongoose.model<IEncounter>('Encounter', EncounterSchema);
```

### 9.2 Model RekamMedis (Extended)

```typescript
// server/models/RekamMedis.ts
export interface IRekamMedis extends Document {
  pasienId: mongoose.Types.ObjectId;
  encounterId: mongoose.Types.ObjectId;
  
  // SOAP
  subjektif: {
    keluhanUtama: string;
    riwayatPenyakitSekarang: string;
    riwayatPenyakitDahulu?: string;
    riwayatKeluarga?: string;
    riwayatAlergi?: string;
    riwayatObat?: string;
  };
  
  objektif: {
    ttv: {
      tekananDarahSistolik?: number;
      tekananDarahDiastolik?: number;
      nadi?: number;
      respirasi?: number;
      suhu?: number;
      spo2?: number;
      beratBadan?: number;
      tinggiBadan?: number;
      lingkarPerut?: number;
      gcs?: number;
    };
    pemeriksaanFisik?: string;
    statusNeurologis?: string;
  };
  
  // Diagnosis
  diagnosisUtama?: {
    kodeICD10: string;
    namaICD10: string;
    status: 'confirmed' | 'suspected' | 'differential';
    fhirConditionId?: string;
  };
  diagnosisLain?: Array<{
    kodeICD10: string;
    namaICD10: string;
    status: 'confirmed' | 'suspected' | 'differential';
    fhirConditionId?: string;
  }>;
  
  // Plan
  plan?: {
    instruksi?: string;
    followUp?: Date;
    kontrolKe?: number;
  };
  
  // CPPT entries (untuk rawat inap)
  cppt?: Array<{
    tanggal: Date;
    petugasId: mongoose.Types.ObjectId;
    profesi: 'dokter' | 'perawat' | 'bidan' | 'fisioterapi' | 'gizi';
    subyektif: string;
    obyektif: string;
    analisis: string;
    plan: string;
  }>;
  
  dokterId: mongoose.Types.ObjectId;
  fhirSyncStatus: string;
  fhirId?: string;
}
```

### 9.3 Model Resep

```typescript
// server/models/Resep.ts
export interface IResepItem {
  obatId: mongoose.Types.ObjectId;
  namaObat: string;
  kodeObat: string;      // Kode KFA (Kode Formularium Nasional)
  kfaCode?: string;      // Kode di SatuSehat/KFA
  bentukSediaan: string;
  kekuatan: string;
  dosis: string;
  rute: 'oral' | 'iv' | 'im' | 'sc' | 'topical' | 'inhalasi' | 'sublingual' | 'rektal' | 'tetes_mata' | 'tetes_telinga';
  durasi?: number;       // hari
  jumlah: number;
  satuan: string;
  instruksi?: string;
  golongan: 'antibiotik' | 'analgesic' | 'antihipertensi' | 'antidiabetik' | 'bronkodilator' | 'narkotika' | 'psikotropika' | 'lainnya';
  fhirMedicationRequestId?: string;
}

export interface IResep extends Document {
  noResep: string;           // RX-2025-XXXXXX
  encounterId: mongoose.Types.ObjectId;
  pasienId: mongoose.Types.ObjectId;
  dokterId: mongoose.Types.ObjectId;
  tanggalResep: Date;
  items: IResepItem[];
  status: 'draft' | 'active' | 'on_hold' | 'cancelled' | 'completed' | 'dispensed';
  catatan?: string;
  mengandungNarkotika: boolean;
  mengandungPsikotropika: boolean;
  fhirSyncStatus: string;
}
```

### 9.4 Model Ranap

```typescript
// server/models/Ranap.ts
export interface IRanap extends Document {
  noRanap: string;           // RNP-2025-XXXXXX
  pasienId: mongoose.Types.ObjectId;
  encounterId: mongoose.Types.ObjectId;
  dpjpId: mongoose.Types.ObjectId;         // Dokter Penanggung Jawab Pasien
  dokterKonsulId?: mongoose.Types.ObjectId[];
  
  tanggalMasuk: Date;
  tanggalKeluar?: Date;
  
  bedId: mongoose.Types.ObjectId;
  ruangan: string;
  noKamar: string;
  noBed: string;
  kelasRawat: 'VIP' | 'I' | 'II' | 'III' | 'HCU' | 'ICU' | 'PICU' | 'NICU';
  
  diagnosisMasuk: string;   // ICD-10
  diagnosisKeluar?: string;
  kondisiKeluar?: 'sembuh' | 'membaik' | 'belum_sembuh' | 'meninggal' | 'pulang_paksa' | 'dirujuk';
  
  instruksiDpjp?: string;
  instruksiPulang?: string;
  
  jenisPembayaran: string;
  noSEP?: string;
  
  losHari?: number;          // Length of Stay (dihitung otomatis)
  
  status: 'active' | 'discharged' | 'transferred' | 'deceased';
  fhirEncounterId?: string;
}
```

### 9.5 Model ICD10

```typescript
// server/models/ICD10.ts
export interface IICD10 extends Document {
  code: string;              // "J18.9"
  display_id: string;        // Bahasa Indonesia
  display_en: string;        // English
  chapter: string;           // "X - Penyakit Sistem Pernapasan"
  category: string;          // "J18"
  parent?: string;
  level: 1 | 2 | 3;         // 1=chapter, 2=kategori, 3=kode lengkap
  searchText: string;        // Untuk full-text search
  isActive: boolean;
}

const ICD10Schema = new Schema<IICD10>({
  code: { type: String, unique: true, required: true, index: true },
  display_id: { type: String, required: true },
  display_en: { type: String, required: true },
  chapter: String,
  category: String,
  parent: String,
  level: { type: Number, enum: [1,2,3] },
  searchText: String,
  isActive: { type: Boolean, default: true }
});

ICD10Schema.index({ searchText: 'text', display_id: 'text', code: 'text' });
ICD10Schema.index({ category: 1 });
```

### 9.6 Model SyncLog

```typescript
// server/models/SyncLog.ts
export interface ISyncLog extends Document {
  sistem: 'satusehat' | 'sinoap' | 'bpjs' | 'dukcapil';
  resource: string;         // 'Patient' | 'Encounter' | 'Condition' | ...
  resourceId: string;       // MongoDB _id
  fhirResource?: string;    // JSON FHIR yang dikirim
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'success' | 'failed';
  httpStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## 10. API Endpoints (Extended)

### 10.1 Antrian

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/antrian?poliId&tanggal` | Daftar antrian per poli per hari |
| `POST` | `/api/antrian` | Buat nomor antrian baru |
| `GET` | `/api/antrian/:id` | Detail antrian |
| `PUT` | `/api/antrian/:id` | Update status |
| `POST` | `/api/antrian/:id/panggil` | Panggil nomor antrian |
| `GET` | `/api/antrian/display/:poliId` | SSE — display antrian realtime |

### 10.2 Encounter

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/encounter?pasienId&tanggal` | Daftar encounter |
| `POST` | `/api/encounter` | Buat encounter baru |
| `GET` | `/api/encounter/:id` | Detail encounter |
| `PUT` | `/api/encounter/:id` | Update encounter |
| `POST` | `/api/encounter/:id/close` | Tutup encounter (status: finished) |
| `POST` | `/api/encounter/:id/vital-signs` | Input tanda vital |
| `POST` | `/api/encounter/:id/cppt` | Tambah CPPT |

### 10.3 Rawat Inap

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/ranap/admission` | Admisi pasien |
| `GET` | `/api/ranap` | Daftar pasien ranap aktif |
| `GET` | `/api/ranap/:id` | Detail ranap |
| `PUT` | `/api/ranap/:id` | Update ranap |
| `POST` | `/api/ranap/:id/discharge` | Discharge pasien |
| `GET` | `/api/ranap/bed` | Status bed |
| `POST` | `/api/ranap/bed/assign` | Assign bed ke pasien |
| `PUT` | `/api/ranap/bed/:id/transfer` | Transfer bed |

### 10.4 Resep & Dispensing

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/resep` | Tulis resep baru |
| `GET` | `/api/resep?encounterId` | Resep per encounter |
| `GET` | `/api/resep/:id` | Detail resep |
| `PUT` | `/api/resep/:id` | Edit resep (jika belum dispensed) |
| `DELETE` | `/api/resep/:id` | Batalkan resep |
| `POST` | `/api/resep/:id/dispense` | Dispensing farmasi |
| `GET` | `/api/resep/antrian-farmasi` | Antrian resep farmasi |

### 10.5 Rujukan

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/rujukan` | Buat rujukan keluar |
| `GET` | `/api/rujukan` | Daftar rujukan |
| `GET` | `/api/rujukan/:id` | Detail rujukan |
| `POST` | `/api/rujukan/terima` | Terima rujukan masuk |
| `GET` | `/api/rujukan/:id/surat` | Download surat rujukan PDF |

### 10.6 ICD Lookup

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/icd/icd10?q=&limit=` | Search ICD-10 |
| `GET` | `/api/icd/icd10/:code` | Detail kode ICD-10 |
| `GET` | `/api/icd/icd9cm?q=&limit=` | Search ICD-9CM |
| `GET` | `/api/icd/icd9cm/:code` | Detail kode ICD-9CM |
| `POST` | `/api/icd/import-icd10` | Import bulk ICD-10 (admin) |
| `POST` | `/api/icd/import-icd9cm` | Import bulk ICD-9CM (admin) |

### 10.7 SatuSehat Management

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/satusehat/sync-status` | Status sync semua resource |
| `POST` | `/api/satusehat/retry` | Retry failed sync |
| `GET` | `/api/satusehat/token-status` | Status OAuth token |
| `POST` | `/api/satusehat/test-connection` | Test koneksi |
| `POST` | `/api/satusehat/webhook` | Webhook dari SatuSehat |

### 10.8 BPJS

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/bpjs/peserta/:noBPJS` | Validasi peserta BPJS |
| `POST` | `/api/bpjs/sep` | Buat SEP (Surat Eligibilitas Peserta) |
| `GET` | `/api/bpjs/sep/:noSEP` | Detail SEP |
| `PUT` | `/api/bpjs/sep/:noSEP` | Update SEP |
| `DELETE` | `/api/bpjs/sep/:noSEP` | Batalkan SEP |
| `POST` | `/api/bpjs/klaim` | Submit klaim BPJS |

---

## 11. FHIR Resource Mapping

### 11.1 Mapping Pasien ↔ FHIR Patient

```typescript
// server/fhir/mappers/patient.mapper.ts

export function toFHIRPatient(pasien: IPasien, orgId: string): fhir4.Patient {
  return {
    resourceType: 'Patient',
    id: pasien.fhirId,
    meta: {
      profile: ['https://fhir.kemkes.go.id/r4/StructureDefinition/Patient']
    },
    identifier: [
      {
        use: 'official',
        system: 'https://fhir.kemkes.go.id/id/nik',
        value: pasien.nik
      },
      {
        use: 'secondary',
        system: `https://fhir.kemkes.go.id/id/rekam-medis/${orgId}`,
        value: pasien.noRM
      },
      ...(pasien.asuransi?.jenis === 'BPJS' ? [{
        use: 'official' as const,
        system: 'https://fhir.kemkes.go.id/id/no-bpjs',
        value: pasien.asuransi.nomor
      }] : [])
    ],
    active: true,
    name: [{
      use: 'official',
      text: pasien.nama
    }],
    telecom: [
      ...(pasien.telepon ? [{ system: 'phone' as const, value: pasien.telepon, use: 'mobile' as const }] : []),
      ...(pasien.email ? [{ system: 'email' as const, value: pasien.email }] : [])
    ],
    gender: pasien.jenis_kelamin === 'L' ? 'male' : 'female',
    birthDate: pasien.tgl_lahir.toISOString().split('T')[0],
    address: [{
      use: 'home',
      line: [pasien.alamat.jalan],
      city: pasien.alamat.kota,
      district: pasien.alamat.kecamatan,
      state: pasien.alamat.provinsi,
      postalCode: pasien.alamat.kodePos,
      country: 'ID'
    }],
    managingOrganization: {
      reference: `Organization/${orgId}`
    }
  };
}

export function fromFHIRPatient(fhirPatient: fhir4.Patient): Partial<IPasien> {
  // Reverse mapping untuk update data dari SatuSehat
  return {
    fhirId: fhirPatient.id,
    nama: fhirPatient.name?.[0]?.text || '',
    // ... dst
  };
}
```

### 11.2 Mapping Encounter ↔ FHIR Encounter

```typescript
// server/fhir/mappers/encounter.mapper.ts

const ENCOUNTER_CLASS_MAP = {
  outpatient: { code: 'AMB', display: 'ambulatory' },
  inpatient: { code: 'IMP', display: 'inpatient' },
  emergency: { code: 'EMER', display: 'emergency' }
};

const ENCOUNTER_STATUS_MAP = {
  planned: 'planned',
  arrived: 'arrived',
  triaged: 'triaged',
  'in-progress': 'in-progress',
  finished: 'finished',
  cancelled: 'cancelled'
};

export function toFHIREncounter(encounter: IEncounter, refs: {
  patientFhirId: string;
  doctorFhirId?: string;
  locationFhirId: string;
  orgFhirId: string;
}): fhir4.Encounter {
  const classCode = ENCOUNTER_CLASS_MAP[encounter.tipe] || ENCOUNTER_CLASS_MAP.outpatient;
  
  return {
    resourceType: 'Encounter',
    id: encounter.fhirId,
    meta: {
      profile: ['https://fhir.kemkes.go.id/r4/StructureDefinition/Encounter']
    },
    identifier: [{
      system: `https://fhir.kemkes.go.id/id/encounter/${refs.orgFhirId}`,
      value: encounter.noEncounter
    }],
    status: ENCOUNTER_STATUS_MAP[encounter.status] as any,
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: classCode.code,
      display: classCode.display
    },
    subject: { reference: `Patient/${refs.patientFhirId}` },
    participant: refs.doctorFhirId ? [{
      type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND' }] }],
      individual: { reference: `Practitioner/${refs.doctorFhirId}` }
    }] : [],
    period: {
      start: encounter.tanggalMulai.toISOString(),
      ...(encounter.tanggalSelesai ? { end: encounter.tanggalSelesai.toISOString() } : {})
    },
    location: [{
      location: { reference: `Location/${refs.locationFhirId}` },
      status: 'active'
    }],
    serviceProvider: { reference: `Organization/${refs.orgFhirId}` }
  };
}
```

---

## 12. Implementasi SatuSehat Client

### 12.1 OAuth2 Token Manager

```typescript
// server/integrations/satusehat/auth.ts

interface TokenCache {
  accessToken: string;
  expiresAt: number; // timestamp ms
}

let tokenCache: TokenCache | null = null;

export async function getSatuSehatToken(): Promise<string> {
  // Cek cache, refresh 60 detik sebelum expired
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }
  
  const config = useRuntimeConfig();
  const baseUrl = config.satusehat.baseUrl;
  
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.satusehat.clientId,
    client_secret: config.satusehat.clientSecret
  });
  
  const response = await $fetch<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }>(`${baseUrl}/oauth2/v1/accesstoken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  
  tokenCache = {
    accessToken: response.access_token,
    expiresAt: Date.now() + (response.expires_in * 1000)
  };
  
  return tokenCache.accessToken;
}

export async function satusehatFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getSatuSehatToken();
  const config = useRuntimeConfig();
  
  const response = await $fetch<T>(`${config.satusehat.baseUrl}/fhir-r4/v1${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response;
}
```

### 12.2 Patient FHIR Operations

```typescript
// server/integrations/satusehat/patient.ts

export async function createFHIRPatient(fhirPatient: fhir4.Patient): Promise<string> {
  const result = await satusehatFetch<fhir4.Patient>('/Patient', {
    method: 'POST',
    body: JSON.stringify(fhirPatient)
  });
  return result.id!;
}

export async function updateFHIRPatient(fhirId: string, fhirPatient: fhir4.Patient): Promise<void> {
  await satusehatFetch(`/Patient/${fhirId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...fhirPatient, id: fhirId })
  });
}

export async function searchFHIRPatientByNIK(nik: string): Promise<fhir4.Patient | null> {
  const bundle = await satusehatFetch<fhir4.Bundle>(`/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`);
  if (bundle.entry && bundle.entry.length > 0) {
    return bundle.entry[0].resource as fhir4.Patient;
  }
  return null;
}
```

### 12.3 FHIR Sync Job

```typescript
// server/jobs/satusehat.job.ts

export interface SyncJob {
  type: 'patient' | 'encounter' | 'condition' | 'medication' | 'observation' | 'procedure';
  resourceId: string;       // MongoDB _id
  action: 'create' | 'update';
  priority: 'high' | 'normal' | 'low';
}

export async function processSyncJob(job: SyncJob): Promise<void> {
  const log = await SyncLog.create({
    sistem: 'satusehat',
    resource: job.type,
    resourceId: job.resourceId,
    action: job.action,
    status: 'pending'
  });
  
  try {
    switch (job.type) {
      case 'patient':
        await syncPatient(job.resourceId, job.action);
        break;
      case 'encounter':
        await syncEncounter(job.resourceId, job.action);
        break;
      case 'condition':
        await syncCondition(job.resourceId, job.action);
        break;
      // ... dll
    }
    
    await SyncLog.findByIdAndUpdate(log._id, {
      status: 'success',
      completedAt: new Date()
    });
    
  } catch (error: any) {
    const retryCount = log.retryCount + 1;
    const nextRetry = new Date(Date.now() + Math.pow(2, retryCount) * 60_000); // Exponential backoff
    
    await SyncLog.findByIdAndUpdate(log._id, {
      status: retryCount < 5 ? 'pending' : 'failed',
      errorMessage: error.message,
      retryCount,
      nextRetryAt: retryCount < 5 ? nextRetry : undefined
    });
  }
}

async function syncPatient(pasienId: string, action: string): Promise<void> {
  const pasien = await Pasien.findById(pasienId);
  if (!pasien) throw new Error('Pasien tidak ditemukan');
  
  const config = useRuntimeConfig();
  const fhirPatient = toFHIRPatient(pasien, config.satusehat.orgId);
  
  let fhirId: string;
  if (action === 'create' || !pasien.fhirId) {
    // Cek apakah sudah ada di SatuSehat via NIK
    const existing = await searchFHIRPatientByNIK(pasien.nik);
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
    fhirSyncStatus: 'success',
    fhirSyncAt: new Date(),
    fhirSyncRetry: 0,
    fhirSyncError: undefined
  });
}
```

---

## 13. Implementasi SINOAP Client

### 13.1 Konfigurasi & Client

```typescript
// server/integrations/sinoap/client.ts

export async function sinoAPFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = useRuntimeConfig();
  
  return $fetch<T>(`${config.sinoap.baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${config.sinoap.apiKey}`,
      'X-Facility-ID': config.sinoap.facilityId,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
}
```

### 13.2 Generate Laporan Bulanan

```typescript
// server/integrations/sinoap/report.ts

export async function generateLaporanBulanan(bulan: number, tahun: number) {
  // Ambil semua dispensing narkotika/psikotropika bulan tersebut
  const dispenses = await Dispensing.find({
    createdAt: {
      $gte: new Date(tahun, bulan - 1, 1),
      $lt: new Date(tahun, bulan, 1)
    },
    'items.golongan': { $in: ['narkotika', 'psikotropika'] }
  }).populate(['resepId', 'pasienId', 'apotekerId']);
  
  const laporanItems = dispenses.flatMap(d => 
    d.items
      .filter(item => ['narkotika', 'psikotropika'].includes(item.golongan))
      .map(item => ({
        noResep: d.resep?.noResep,
        tanggalResep: d.resep?.tanggalResep,
        namaPasien: d.pasien?.nama,
        dokterNama: d.resep?.dokter?.nama,
        dokterSIP: d.resep?.dokter?.sip,
        namaObat: item.namaObat,
        kodeBPOM: item.kodeBPOM,
        jumlah: item.jumlahDiberikan,
        satuan: item.satuan,
        golongan: item.golongan
      }))
  );
  
  // Submit ke SINOAP
  return sinoAPFetch('/laporan/bulanan', {
    method: 'POST',
    body: JSON.stringify({
      fasilitasId: useRuntimeConfig().sinoap.facilityId,
      periode: { bulan, tahun },
      items: laporanItems
    })
  });
}
```

---

## 14. Halaman & Komponen Baru

### 14.1 Komponen DiagnosisSearch.vue

```vue
<!-- components/emr/DiagnosisSearch.vue -->
<template>
  <div class="diagnosis-search">
    <UInput
      v-model="query"
      placeholder="Ketik kode atau nama penyakit..."
      icon="i-heroicons-magnifying-glass"
      :loading="isSearching"
      @input="onSearch"
    />
    
    <div v-if="results.length" class="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto w-full">
      <div
        v-for="icd in results"
        :key="icd.code"
        class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
        @click="selectDiagnosis(icd)"
      >
        <span class="font-mono text-blue-700 font-bold">{{ icd.code }}</span>
        <span class="ml-2 text-gray-800">{{ icd.display_id }}</span>
        <span class="text-xs text-gray-400 ml-2">{{ icd.display_en }}</span>
      </div>
    </div>
    
    <!-- Selected diagnoses -->
    <div v-if="selected.length" class="mt-2 flex flex-wrap gap-2">
      <UBadge
        v-for="diag in selected"
        :key="diag.code"
        :label="`${diag.code} — ${diag.display_id}`"
        color="blue"
        variant="soft"
        class="cursor-pointer"
        @click="removeDiagnosis(diag.code)"
      >
        <template #trailing>
          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
        </template>
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ICD10Item {
  code: string;
  display_id: string;
  display_en: string;
}

const props = defineProps<{
  modelValue: ICD10Item[];
  maxSelect?: number;
}>();

const emit = defineEmits(['update:modelValue']);

const query = ref('');
const results = ref<ICD10Item[]>([]);
const isSearching = ref(false);
const selected = computed(() => props.modelValue);

const onSearch = useDebounceFn(async () => {
  if (query.value.length < 2) { results.value = []; return; }
  isSearching.value = true;
  try {
    const data = await $fetch<ICD10Item[]>(`/api/icd/icd10?q=${query.value}&limit=10`);
    results.value = data;
  } finally {
    isSearching.value = false;
  }
}, 300);

function selectDiagnosis(icd: ICD10Item) {
  if (!selected.value.find(d => d.code === icd.code)) {
    emit('update:modelValue', [...selected.value, icd]);
  }
  query.value = '';
  results.value = [];
}

function removeDiagnosis(code: string) {
  emit('update:modelValue', selected.value.filter(d => d.code !== code));
}
</script>
```

### 14.2 Komponen SyncStatus.vue

```vue
<!-- components/satusehat/SyncStatus.vue -->
<template>
  <UTooltip :text="tooltipText">
    <UBadge
      :color="badgeColor"
      :label="badgeLabel"
      variant="soft"
      class="cursor-help"
    >
      <template #leading>
        <UIcon :name="badgeIcon" class="w-3 h-3" />
      </template>
    </UBadge>
  </UTooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'pending' | 'sent' | 'success' | 'failed' | 'not_required';
  lastSync?: Date;
  error?: string;
}>();

const badgeColor = computed(() => ({
  pending: 'yellow',
  sent: 'blue',
  success: 'green',
  failed: 'red',
  not_required: 'gray'
}[props.status]));

const badgeLabel = computed(() => ({
  pending: 'Menunggu Sync',
  sent: 'Dikirim',
  success: 'Tersync',
  failed: 'Gagal',
  not_required: 'N/A'
}[props.status]));

const badgeIcon = computed(() => ({
  pending: 'i-heroicons-clock',
  sent: 'i-heroicons-arrow-up-circle',
  success: 'i-heroicons-check-circle',
  failed: 'i-heroicons-x-circle',
  not_required: 'i-heroicons-minus'
}[props.status]));

const tooltipText = computed(() => {
  if (props.status === 'failed' && props.error) return `Gagal: ${props.error}`;
  if (props.status === 'success' && props.lastSync) {
    return `Tersync: ${new Date(props.lastSync).toLocaleString('id-ID')}`;
  }
  return `Status SatuSehat: ${badgeLabel.value}`;
});
</script>
```

### 14.3 Halaman EMR Workspace

```vue
<!-- pages/emr/[encounterId].vue -->
<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Header Bar -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <div>
          <h2 class="font-bold text-gray-900">{{ pasien?.nama }}</h2>
          <p class="text-sm text-gray-500">
            {{ pasien?.noRM }} · {{ usiaPasien }} thn · {{ pasien?.jenis_kelamin === 'L' ? '♂' : '♀' }}
            · {{ encounter?.jenisPembayaran }}
          </p>
        </div>
        <UBadge :label="encounter?.status" color="blue" />
        <SatusehatSyncStatus :status="encounter?.fhirSyncStatus" />
      </div>
      <div class="flex gap-2">
        <UButton icon="i-heroicons-document-text" variant="ghost" @click="cetakResume">Resume</UButton>
        <UButton icon="i-heroicons-check" color="green" @click="tutupEncounter">Selesai</UButton>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-2 gap-4 p-4 h-full">
        
        <!-- KIRI: Subjektif & Objektif -->
        <div class="space-y-4">
          <!-- Tanda Vital (read-only dari triage) -->
          <UCard>
            <template #header>
              <h3 class="font-semibold">Tanda Vital</h3>
            </template>
            <EmrVitalSigns :ttv="encounter?.vitalSigns" :editable="canEditVital" @save="saveTTV" />
          </UCard>
          
          <!-- SOAP Subjektif -->
          <UCard>
            <template #header><h3 class="font-semibold">Subjektif / Anamnesis</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Keluhan Utama">
                <UTextarea v-model="soap.keluhanUtama" rows="2" />
              </UFormGroup>
              <UFormGroup label="Riwayat Penyakit Sekarang">
                <UTextarea v-model="soap.rps" rows="4" />
              </UFormGroup>
              <UFormGroup label="Riwayat Penyakit Dahulu">
                <UTextarea v-model="soap.rpd" rows="2" />
              </UFormGroup>
              <UFormGroup label="Riwayat Alergi">
                <UInput v-model="soap.alergi" placeholder="Tidak ada alergi" />
              </UFormGroup>
            </div>
          </UCard>
          
          <!-- Pemeriksaan Fisik -->
          <UCard>
            <template #header><h3 class="font-semibold">Pemeriksaan Fisik</h3></template>
            <UTextarea v-model="soap.pemFisik" rows="5" placeholder="Keadaan umum, kesadaran, sistem organ..." />
          </UCard>
        </div>
        
        <!-- KANAN: Assessment & Plan -->
        <div class="space-y-4">
          <!-- Diagnosis ICD-10 -->
          <UCard>
            <template #header><h3 class="font-semibold">Diagnosis (ICD-10)</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Diagnosis Utama *">
                <EmrDiagnosisSearch
                  v-model="diagnosisUtama"
                  :max-select="1"
                  placeholder="Cari kode ICD-10..."
                />
              </UFormGroup>
              <UFormGroup label="Diagnosis Sekunder">
                <EmrDiagnosisSearch v-model="diagnosisLain" placeholder="Tambah diagnosis lain..." />
              </UFormGroup>
            </div>
          </UCard>
          
          <!-- Tindakan ICD-9CM -->
          <UCard>
            <template #header><h3 class="font-semibold">Tindakan / Prosedur (ICD-9CM)</h3></template>
            <EmrTindakanSearch v-model="tindakanList" />
          </UCard>
          
          <!-- Resep -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="font-semibold">Resep Elektronik</h3>
                <UButton size="xs" icon="i-heroicons-plus" @click="tambahObat">Tambah Obat</UButton>
              </div>
            </template>
            <EmrMedicationForm v-model="resepItems" />
          </UCard>
          
          <!-- Plan -->
          <UCard>
            <template #header><h3 class="font-semibold">Plan / Instruksi</h3></template>
            <div class="space-y-3">
              <UFormGroup label="Instruksi">
                <UTextarea v-model="soap.instruksi" rows="3" />
              </UFormGroup>
              <UFormGroup label="Kontrol Kembali">
                <UInput type="date" v-model="soap.followUp" />
              </UFormGroup>
              <div class="flex gap-2">
                <UButton variant="outline" icon="i-heroicons-arrow-right" @click="buatRujukan">
                  Buat Rujukan
                </UButton>
                <UButton variant="outline" color="orange" icon="i-heroicons-building-office" @click="rawatInap">
                  Rawat Inap
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 15. Alur Data End-to-End

### 15.1 Diagram Alur Lengkap

```
PASIEN DATANG
     │
     ▼
┌─────────────────┐
│  PENDAFTARAN    │ → Validasi NIK (Dukcapil)
│  /pendaftaran   │ → Validasi BPJS (P-Care)
└────────┬────────┘ → Pasien.create() → MongoDB
         │           → Job: FHIR Patient sync → SatuSehat
         ▼
┌─────────────────┐
│  ANTRIAN        │ → Encounter.create() (status: planned)
│  /pendaftaran/  │ → Antrian.create()
│  antrian        │ → Job: FHIR Encounter create
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TRIAGE (Nurse) │ → Input TTV
│  /emr/:id       │ → Observation.create()
└────────┬────────┘ → Job: FHIR Observation bundle
         │
         ▼
┌─────────────────┐
│  POLI / DOKTER  │ → RekamMedis update (SOAP)
│  /emr/:id       │ → Diagnosis ICD-10 → Condition.create()
│  /poli/:id      │ → Tindakan ICD-9CM → Procedure.create()
└────────┬────────┘ → Job: FHIR Condition/Procedure sync
         │
         ▼
┌─────────────────┐
│  RESEP          │ → Resep.create()
│  (dalam EMR)    │ → MedicationRequest per item
└────────┬────────┘ → Job: FHIR MedicationRequest sync
         │           → Cek Narkotika/Psikotropika → SINOAP flag
         ▼
┌─────────────────┐
│  FARMASI        │ → Verifikasi resep
│  /farmasi       │ → Dispensing.create()
└────────┬────────┘ → Kurangi stok obat
         │           → Job: FHIR MedicationDispense
         │           → Jika narkotika: SINOAPLog
         ▼
┌─────────────────┐
│  KASIR/BILLING  │ → Billing.create()
│  /billing       │ → Jika BPJS: submit klaim VClaim
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CLOSE VISIT    │ → Encounter.status = finished
│                 │ → Job: FHIR Encounter update (finished)
└─────────────────┘

BACKGROUND JOBS (server/jobs/)
├── SatuSehat sync job (runs every 30 seconds)
│   └── Process pending SyncLog entries
├── SINOAP report job (runs monthly)
│   └── Generate & submit laporan bulanan
├── BPJS klaim job (runs daily)
│   └── Submit klaim yang pending
└── Retry job (runs every 5 minutes)
    └── Retry failed sync dengan exponential backoff
```

---

## 16. Konfigurasi & Environment

### 16.1 nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  
  runtimeConfig: {
    // Private (server only)
    mongoUri: process.env.MONGODB_URI,
    
    // SatuSehat
    satusehat: {
      baseUrl: process.env.SATUSEHAT_BASE_URL,
      clientId: process.env.SATUSEHAT_CLIENT_ID,
      clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
      orgId: process.env.SATUSEHAT_ORG_ID,            // Organization ID di SatuSehat
      locationIdMap: process.env.SATUSEHAT_LOCATION_MAP // JSON: { "poliId": "fhirLocationId" }
    },
    
    // SINOAP
    sinoap: {
      baseUrl: process.env.SINOAP_BASE_URL,
      apiKey: process.env.SINOAP_API_KEY,
      facilityId: process.env.SINOAP_FACILITY_ID
    },
    
    // BPJS
    bpjs: {
      pCareUrl: process.env.BPJS_PCARE_URL,
      vClaimUrl: process.env.BPJS_VCLAIM_URL,
      consId: process.env.BPJS_CONS_ID,
      secretKey: process.env.BPJS_SECRET_KEY,
      userKey: process.env.BPJS_USER_KEY,
      ppkCode: process.env.BPJS_PPK_CODE         // Kode PPK/RS
    },
    
    // Dukcapil
    dukcapil: {
      url: process.env.DUKCAPIL_URL,
      apiKey: process.env.DUKCAPIL_API_KEY
    },
    
    // Public (exposed to client)
    public: {
      appName: 'e-Health SIMPRS',
      rsName: process.env.RS_NAME || 'Rumah Sakit',
      rsCode: process.env.RS_CODE
    }
  },
  
  modules: ['@sidebase/nuxt-auth', '@nuxt/ui'],
  
  nitro: {
    // Schedule background jobs
    scheduledTasks: {
      '*/30 * * * * *': ['satusehat-sync'],   // Setiap 30 detik
      '*/5 * * * *': ['retry-failed-sync'],   // Setiap 5 menit
      '0 2 * * *': ['bpjs-klaim'],            // Setiap hari jam 02:00
      '0 8 1 * *': ['sinoap-laporan']         // Tanggal 1 jam 08:00
    }
  }
});
```

### 16.2 .env File

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ehealth

# Auth
NEXTAUTH_SECRET=your-secret-key-minimum-32-chars
NEXTAUTH_URL=http://localhost:3000

# Rumah Sakit
RS_NAME=RS Umum Daerah XYZ
RS_CODE=0101A001

# SatuSehat (Development)
SATUSEHAT_BASE_URL=https://api-satusehat-dev.dto.kemkes.go.id
SATUSEHAT_CLIENT_ID=your-client-id
SATUSEHAT_CLIENT_SECRET=your-client-secret
SATUSEHAT_ORG_ID=your-organization-fhir-id

# SINOAP
SINOAP_BASE_URL=https://sinoap.kemkes.go.id/api
SINOAP_API_KEY=your-sinoap-key
SINOAP_FACILITY_ID=your-facility-id

# BPJS P-Care & VClaim
BPJS_PCARE_URL=https://apijkn-dev.bpjs-kesehatan.go.id/pcare/rest/v1
BPJS_VCLAIM_URL=https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest
BPJS_CONS_ID=your-cons-id
BPJS_SECRET_KEY=your-secret-key
BPJS_USER_KEY=your-user-key
BPJS_PPK_CODE=your-ppk-code

# Dukcapil
DUKCAPIL_URL=https://api.dukcapil.kemkes.go.id
DUKCAPIL_API_KEY=your-dukcapil-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@rsxyz.com
SMTP_PASS=your-smtp-password
```

---

## 17. Queue & Background Job

### 17.1 Job Queue Sederhana (MongoDB-based)

```typescript
// server/jobs/queue.ts
// Karena tidak ada Redis, gunakan MongoDB sebagai job queue

interface Job {
  type: string;
  payload: Record<string, any>;
  priority: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
  runAt: Date;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
}

const JobSchema = new Schema<Job>({...});
const JobModel = mongoose.model('Job', JobSchema);

export async function enqueue(type: string, payload: any, options: {
  priority?: number;
  delay?: number; // ms
} = {}): Promise<void> {
  await JobModel.create({
    type,
    payload,
    priority: options.priority ?? 5,
    status: 'pending',
    runAt: new Date(Date.now() + (options.delay ?? 0)),
    attempts: 0,
    maxAttempts: 5
  });
}

export async function processQueue(): Promise<void> {
  const job = await JobModel.findOneAndUpdate(
    { status: 'pending', runAt: { $lte: new Date() } },
    { status: 'processing', $inc: { attempts: 1 } },
    { sort: { priority: 1, createdAt: 1 }, new: true }
  );
  
  if (!job) return;
  
  try {
    await handlers[job.type](job.payload);
    await JobModel.findByIdAndUpdate(job._id, { status: 'done' });
  } catch (error: any) {
    const failed = job.attempts >= job.maxAttempts;
    await JobModel.findByIdAndUpdate(job._id, {
      status: failed ? 'failed' : 'pending',
      lastError: error.message,
      runAt: new Date(Date.now() + Math.pow(2, job.attempts) * 30_000)
    });
  }
}
```

### 17.2 Nitro Scheduled Tasks

```typescript
// server/tasks/satusehat-sync.ts
export default defineTask({
  meta: { name: 'satusehat-sync', description: 'Sync pending data ke SatuSehat' },
  async run() {
    const pending = await SyncLog.find({
      sistem: 'satusehat',
      status: 'pending',
      $or: [
        { nextRetryAt: { $exists: false } },
        { nextRetryAt: { $lte: new Date() } }
      ]
    }).limit(20);
    
    for (const log of pending) {
      await processSyncJob({
        type: log.resource as any,
        resourceId: log.resourceId,
        action: log.action as any,
        priority: 'normal'
      });
    }
    
    return { processed: pending.length };
  }
});
```

---

## 18. Checklist Compliance PMK 24/2022

### 18.1 Rekam Medis Elektronik

| Requirement | Status | Implementasi |
|-------------|--------|-------------|
| Identitas pasien lengkap | ✅ | Model Pasien + NIK validasi |
| Tanggal & waktu pemeriksaan | ✅ | Timestamp di setiap encounter |
| Anamnesis (keluhan, riwayat) | ✅ | SOAP Note — field Subjektif |
| Pemeriksaan fisik | ✅ | SOAP Note — field Objektif |
| Diagnosis (ICD-10) | ✅ | Integrasi ICD-10 + FHIR Condition |
| Tindakan (ICD-9CM) | ✅ | Integrasi ICD-9CM + FHIR Procedure |
| Resep & obat | ✅ | Resep elektronik + FHIR MedicationRequest |
| Tanda tangan digital dokter | 🔄 | Implementasi e-signature (tahap 2) |
| Nomor rekam medis unik | ✅ | Auto-generate RM-YYYY-XXXXXX |
| Audit trail perubahan | ✅ | SyncLog + MongoDB timestamps |
| Kerahasiaan data (role-based) | ✅ | RBAC matrix |

### 18.2 Integrasi SatuSehat

| Resource FHIR | Wajib | Status |
|---------------|-------|--------|
| Patient | ✅ | Implemented |
| Practitioner | ✅ | Implemented |
| Organization | ✅ | Satu kali setup |
| Location | ✅ | Satu kali setup |
| Encounter | ✅ | Implemented |
| Condition (Diagnosis) | ✅ | Implemented |
| Procedure | ✅ | Implemented |
| MedicationRequest | ✅ | Implemented |
| MedicationDispense | ✅ | Implemented |
| Observation (TTV) | ✅ | Implemented |
| AllergyIntolerance | 🔄 | Planned |
| ServiceRequest (Lab) | 🔄 | Planned |
| DiagnosticReport | 🔄 | Planned |
| Composition (Resume) | 🔄 | Planned |

### 18.3 Roadmap Implementasi

**Phase 1 — Core SIMPRS (2-3 bulan)**

- Pendaftaran & antrian
- EMR workspace (SOAP Note)
- Diagnosis ICD-10 & tindakan ICD-9CM
- Resep elektronik
- Rawat inap dasar
- Rujukan

**Phase 2 — Integrasi (1-2 bulan)**

- SatuSehat FHIR R4 (Patient, Encounter, Condition, MedicationRequest)
- BPJS P-Care + VClaim
- Import data ICD-10 (10.000+ kode)
- Import data ICD-9CM

**Phase 3 — Advanced (2-3 bulan)**

- SINOAP pelaporan
- Lab & radiologi order
- E-signature dokter
- FHIR Observation (TTV)
- Dashboard analytics

**Phase 4 — Optimasi (ongoing)**

- FHIR ServiceRequest & DiagnosticReport
- Composition (resume medis)
- Peningkatan UX
- Load testing & optimasi performa

---

## Catatan Penting untuk Developer

### Library yang Perlu Ditambahkan

```bash
# Package baru yang dibutuhkan
npm install \
  fhir                    # FHIR types & utilities \
  @types/fhir             # TypeScript types untuk FHIR \
  node-cron               # Scheduler (alternatif jika Nitro scheduled tasks belum support) \
  ioredis                 # Jika ingin upgrade ke Redis queue \
  exceljs                 # Import data ICD (lebih baik dari xlsx untuk file besar) \
  winston                 # Logging terstruktur \
  zod                     # (existing) validasi schema
```

### Data Seed ICD-10 & ICD-9CM

Data ICD-10 (±15.000 kode) dan ICD-9CM (±5.000 kode) bisa didapat dari:

- WHO ICD-10 browser: <https://icd.who.int/browse10>
- Kemenkes RI ICD-10 terjemahan (file Excel dari Kemenkes)
- BPOM untuk kode KFA obat

```typescript
// scripts/seed-icd10.ts
// Jalankan sekali: npx tsx scripts/seed-icd10.ts
import icd10Data from './icd10-full.json';
await ICD10.insertMany(icd10Data.map(item => ({
  ...item,
  searchText: `${item.code} ${item.display_id} ${item.display_en}`.toLowerCase()
})));
```

### Tips Integrasi SatuSehat

1. **Daftarkan RS dulu** di <https://satusehat.kemkes.go.id> → dapatkan Organization ID
2. **Daftarkan setiap poli** sebagai Location FHIR
3. **Daftarkan setiap dokter** sebagai Practitioner FHIR
4. **Gunakan environment Development** dulu, baru pindah ke Production setelah testing
5. **Token OAuth2 berlaku 1 jam**, selalu cache dan refresh tepat waktu
6. **Rate limit**: SatuSehat membatasi request — gunakan job queue, jangan fire-and-forget langsung

---

*Dokumen ini adalah panduan teknis lengkap untuk membangun SIMPRS + EMR berbasis e-Health yang telah ada, dengan tambahan integrasi SatuSehat FHIR R4, SINOAP, ICD-10/ICD-9CM, dan BPJS. Implementasi bertahap sesuai roadmap Phase 1-4 sangat direkomendasikan.*
