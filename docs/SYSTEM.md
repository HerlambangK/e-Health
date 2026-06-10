# e-Health — Sistem Informasi Manajemen Klinik & Rumah Sakit

> **Tech Stack:** Nuxt 3 · Vue 3 · Tailwind CSS · MongoDB · NextAuth.js · Nuxt UI

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Role & Hak Akses](#role--hak-akses)
- [Alur Autentikasi](#alur-autentikasi)
- [Halaman & Fungsinya](#halaman--fungsinya)
- [API Endpoints](#api-endpoints)
- [Alur Data](#alur-data)
- [Fitur Unggulan](#fitur-unggulan)

---

## Gambaran Umum

Aplikasi **e-Health** adalah SPA (Single Page Application) untuk mengelola operasional klinik/rumah sakit secara digital. Mencakup manajemen pasien, dokter, rekam medis, janji temu, billing, obat, penyakit, mapping ruangan, rute ambulans, hingga email blast.

SSR dimatikan (`ssr: false`), semua rendering terjadi di sisi klien. API berjalan di server Nitro (Nuxt) dengan MongoDB sebagai database.

---

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Framework** | Nuxt 3.9.1, Vue 3.3.10, Vue Router 4.2.5 |
| **UI** | Nuxt UI 2.11.1, Tailwind CSS, Naive UI, Flowbite |
| **Auth** | `@sidebase/nuxt-auth` 0.6.4 (wrapper NextAuth.js 4), JWT, Credentials Provider |
| **Database** | MongoDB + Mongoose 8.0.3 |
| **Charts** | Chart.js, ECharts, Unovis |
| **Calendar** | FullCalendar 6.1.10 |
| **Maps** | Leaflet + OSRM (rute), Mapbox GL (3D) |
| **Email** | Nodemailer + SMTP |
| **File** | xlsx (Excel), html2pdf.js |
| **Form/Validation** | Zod, h3-zod |
| **Testing** | Vitest |

---

## Struktur Proyek

```
e-Health/
├── app.vue                        # Root — NuxtLayout, NuxtPage, offline banner
├── error.vue                      # Custom error page (404/500)
├── nuxt.config.ts                 # Konfigurasi Nuxt
├── package.json                   # Dependencies & scripts
├── tailwind.config.ts
│
├── components/
│   ├── admin/                     # Komponen admin (Overview, navburger, RoomMappingCanvas, dll)
│   ├── dashboard/                 # Dashboard patient (history, CollectionActionMenu)
│   ├── form/                      # Form dokter & pasien
│   ├── homepage/                  # Landing page (header, aboutus, map3d, footer, dll)
│   ├── patient/                   # Diagnosis, visit, riwayat
│   ├── Wrapper/Auth.vue           # Layout wrapper halaman auth
│   ├── ColorSwitcher.vue          # Toggle dark/light mode
│   ├── Logo.vue                   # Logo aplikasi
│   ├── Navbar.vue                 # Top navigation bar
│   └── Sidebar.vue                # Sidebar navigasi (bisa di-collapse)
│
├── composables/
│   ├── useOffline.ts              # Deteksi koneksi internet
│   └── usePasien.ts               # CRUD pasien reusable
│
├── data/
│   └── room-mapping.ts            # Definisi peta ruangan
│
├── layouts/
│   ├── default.vue                # Layout utama (sidebar + navbar + konten)
│   └── home.vue                   # Layout landing page (tanpa sidebar)
│
├── middleware/
│   ├── auth-middleware.ts         # Guard rute — cek auth + role
│   └── guest.ts                   # Redirect user terauth ke dashboard
│
├── pages/
│   ├── index.vue                  # Landing page
│   ├── dashboard.vue              # Dashboard pasien
│   ├── map.vue                    # Rute ambulans
│   ├── auth/
│   │   ├── signin.vue             # Login
│   │   └── signup.vue             # Registrasi
│   ├── admin/
│   │   ├── index.vue              # Dashboard admin
│   │   ├── email-blast.vue        # Kirim email massal
│   │   ├── map-3d.vue             # Mapbox 3D
│   │   └── room-mapping.vue       # Mapping ruangan
│   ├── doctor/
│   │   └── index.vue              # Daftar dokter
│   └── patient-record/
│       ├── index.vue              # Rekam medis
│       ├── appointment.vue        # Kalender janji temu
│       ├── billing.vue            # Billing/invoice
│       ├── list-patient.vue       # Daftar pasien
│       ├── medical-chart.vue      # Grafik kunjungan
│       ├── exportData.vue         # Export Excel
│       └── rekam-medis/
│           └── [patientId].vue    # Detail rekam medis per pasien
│
├── plugins/                       # Chart, Marquee
├── public/                        # Static assets (images, favicon)
├── schemas/                       # Zod validation schemas
│
├── server/
│   ├── api/                       # REST API endpoints
│   │   ├── auth/                  # NextAuth [...].ts + signup
│   │   ├── admin/                 # Email templates, email blast
│   │   ├── appointment/           # CRUD appointment
│   │   ├── billing/               # CRUD billing
│   │   ├── dashboard/             # Statistik dashboard
│   │   ├── dokter/                # CRUD dokter
│   │   ├── obat/                  # CRUD obat
│   │   ├── pasien/                # CRUD pasien
│   │   ├── penyakit/              # CRUD penyakit
│   │   ├── rekamedis/             # CRUD rekam medis
│   │   └── routes/                # Data rute ambulans
│   ├── middleware/
│   │   ├── auth.ts                # RBAC server-side tiap request API
│   │   └── logging.ts             # Logging request
│   ├── models/                    # Mongoose models (User, Pasien, Dokter, dll)
│   ├── plugins/
│   │   └── mongoose.ts            # Koneksi MongoDB
│   └── utils/                     # Helper (hash, mailer, pagination, response, emailTemplates)
│
├── tests/                         # Unit test (permissions)
└── utils/                         # Shared utilities
    ├── index.ts                   # Navigasi links, date formatter
    └── permissions.ts             # RBAC definitions & helpers
```

---

## Role & Hak Akses

### 6 Role User

| Role | Tipe | Deskripsi |
|------|------|-----------|
| `admin` | Staff | Akses penuh ke seluruh sistem |
| `doctor` | Medis | Lihat pasien, baca/tulis rekam medis |
| `nurse` | Medis | Lihat pasien, baca/edit rekam medis |
| `receptionist` | Front office | Buat/lihat pasien & janji temu |
| `billing` | Keuangan | Lihat/edit billing, lihat pasien |
| `patient` | Pasien | Lihat data sendiri, janji temu, billing |

### Matrix Permission

| Resource | admin | doctor | nurse | receptionist | billing | patient |
|----------|-------|--------|-------|-------------|---------|---------|
| pasien | CRUD | R | R | CRU | R | R |
| dokter | CRUD | R | R | R | R | R |
| rekamedis | CRUD | CRU | RU | R | – | R |
| appointment | CRUD | R | R | CRU | R | R |
| billing | CRUD | – | – | R | RU | R |
| dashboard | R | R | R | R | R | R |
| obat | CRUD | R | R | R | – | – |
| penyakit | CRUD | R | R | R | – | – |
| admin | CRUD | – | – | – | – | – |

### Route Access per Role

| Route | Allowed Roles |
|-------|--------------|
| `/` | Semua (publik) |
| `/auth/*` | Semua (publik / guest) |
| `/dashboard` | patient |
| `/admin/*` | admin |
| `/doctor` | admin, doctor, nurse, receptionist, billing |
| `/patient-record/*` | admin, doctor, nurse, receptionist, billing |
| `/patient-record/billing` | admin, billing, receptionist, patient |
| `/patient-record/appointment` | admin, doctor, nurse, receptionist, patient |
| `/patient-record/exportData` | admin |
| `/map` | admin, doctor, nurse, receptionist |

---

## Alur Autentikasi

### Registrasi

```
Signup Form → Zod Validation → POST /api/auth/signup → Cek duplikat email
→ Hash password (bcrypt) → Simpan User (role: patient) → Redirect /auth/signin
```

### Login

```
Signin Form → Zod Validation → signIn("credentials") → NextAuth [...].ts
→ Cari user by email → Cek isActive → bcrypt.compare password
→ Update lastLogin → JWT token → Redirect /dashboard
```

### Route Guard (Client)

Middleware `auth-middleware.ts` di `definePageMeta`:
- **Status unauthenticated** → redirect `/auth/signin`
- **Status inactive** → redirect `/auth/signin`
- **Role tidak punya akses rute** → redirect ke fallback:
  - admin → `/admin`
  - doctor → `/doctor`
  - nurse / receptionist → `/patient-record`
  - billing → `/patient-record/billing`
  - patient → `/dashboard`

### API Guard (Server)

`server/middleware/auth.ts` jalan di setiap request `/api/*` (kecuali `/api/auth`):

```
Request API → getServerSession → normalizeRole → cek isActive
→ map path → resource → map method → action
→ hasPermission(role, resource, action)? → 401/403 atau lanjut
```

---

## Halaman & Fungsinya

### Publik (tanpa login)

| Route | Layout | Fungsi |
|-------|--------|--------|
| `/` | `home` | Landing page (hero, about, services, 3D preview, client logos, contact form, footer) |
| `/auth/signin` | `home` | Login form |
| `/auth/signup` | `home` | Registrasi form |

### Dashboard

| Route | Role | Layout | Fungsi |
|-------|------|--------|--------|
| `/dashboard` | patient | `default` | Ringkasan kesehatan, diagnosis terbaru, rencana perawatan, obat, tanda vital, janji temu berikutnya, riwayat kunjungan, catatan pribadi |
| `/admin` | admin | `default` | Statistik pasien/dokter, grafik tren kunjungan 7 hari, quick actions |

### Manajemen Data

| Route | Layout | Fungsi |
|-------|--------|--------|
| `/patient-record` | `default` | Daftar rekam medis (tabel dengan pasien, dokter, poli, kontrol terakhir) |
| `/patient-record/list-patient` | `default` | Daftar pasien (search/filter by nama, alamat, telepon, asuransi) |
| `/patient-record/rekam-medis/[patientId]` | `default` | Detail rekam medis per pasien — diagnosis, penyakit, obat, lab, tanda vital, riwayat kunjungan |
| `/doctor` | `default` | Daftar dokter (nama, NIP, spesialisasi, poli, jadwal, kehadiran) |
| `/patient-record/medical-chart` | `default` | Grafik tren kunjungan pasien 7 hari (Chart.js) |

### Operasional

| Route | Layout | Fungsi |
|-------|--------|--------|
| `/patient-record/appointment` | `default` | Kalender janji temu (FullCalendar — month/week/day/list), create/edit/detail modal, deteksi bentrok jadwal dokter |
| `/patient-record/billing` | `default` | Manajemen invoice — daftar billing, create dengan auto-calculate total, status flow: draft → issued → paid → void |
| `/patient-record/exportData` | `default` | Export 3 dataset ke Excel: Pasien, Dokter, atau Rekam Medis |

### Admin Khusus

| Route | Layout | Fungsi |
|-------|--------|--------|
| `/admin/email-blast` | `default` | Upload Excel kandidat, mapping kolom ke placeholder template, kirim email massal via Nodemailer SMTP |
| `/admin/map-3d` | `default` | Visualisasi 3D RS Jantung IHC Karawang (Mapbox GL) — building footprints, markers, info panel |
| `/admin/room-mapping` | `default` | Peta interaktif denah ruangan — SVG floor plan, kategori ruangan (public, diagnostic, emergency, support), search/filter, popup info |

### Ekstra

| Route | Layout | Fungsi |
|-------|--------|--------|
| `/map` | `default` | Rute ambulans interaktif (Leaflet + OSRM) — multiple vehicle, custom waypoints, animasi kendaraan, draggable waypoints, distance/duration |

---

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `*` | `/api/auth/[...]` | NextAuth.js catch-all |
| `POST` | `/api/auth/signup` | Registrasi user baru |

### Admin

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/admin/email-templates` | List template email |
| `POST` | `/api/admin/email-templates` | Buat template |
| `PUT` | `/api/admin/email-templates/[id]` | Update template |
| `DELETE` | `/api/admin/email-templates/[id]` | Hapus template |
| `POST` | `/api/admin/email-blast` | Kirim email massal |

### Resource CRUD (setiap resource punya 5 endpoint)

| Resource | Endpoint | Deskripsi |
|----------|----------|-----------|
| **Pasien** | `/api/pasien` | CRUD pasien (paginated, filterable) |
| **Dokter** | `/api/dokter` | CRUD dokter (unique NIP) |
| **Rekam Medis** | `/api/rekamedis` | CRUD rekam medis (patient-scoped) |
| **Appointment** | `/api/appointment` | CRUD janji temu (conflict detection) |
| **Billing** | `/api/billing` | CRUD billing (auto-calculate total) |
| **Obat** | `/api/obat` | CRUD obat |
| **Penyakit** | `/api/penyakit` | CRUD penyakit |

### Lainnya

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/summary` | Statistik dashboard (doctor count, patient count, appointments, billing count, visit trend) |
| `GET` | `/api/routes/ambulance` | Data rute ambulans |

Semua response API mengikuti format standar:

```ts
{
  data: T | null,
  meta?: { page, pageSize, total },
  error?: { code, message, details? }
}
```

---

## Alur Data

```
MongoDB  ←→  Mongoose Models  ←→  API Routes (Nitro)  ←→  $fetch / useAsyncData  ←→  Pages  ←→  Components
```

1. **Model** — Definisi schema Mongoose + interface TypeScript (`server/models/`)
2. **API** — Handler di `server/api/` dengan:
   - Validasi Zod (`schemas/`)
   - Pagination helper (`server/utils/pagination.ts`)
   - Response standar (`server/utils/response.ts`: `sendSuccess()` / `sendApiError()`)
   - Patient-scoped filtering untuk role patient
3. **Middleware** — Server auth (`server/middleware/auth.ts`) intercept tiap request API, cek JWT + permission matrix
4. **Page** — Panggil API via `$fetch()` atau `useAsyncData()`, render data menggunakan komponen Nuxt UI

---

## Fitur Unggulan

| Fitur | Detail Teknis |
|-------|---------------|
| **Role-Based Access Control** | Permission matrix di `utils/permissions.ts`, di-enforce di client (`auth-middleware.ts`) dan server (`server/middleware/auth.ts`) |
| **Deteksi Bentrok Jadwal** | Appointment API cek overlap sebelum create/update, kirim 409 jika bentrok |
| **Export Excel 3 Dataset** | `xlsx` library — data pasien, dokter, atau rekam medis |
| **Email Blast** | Upload Excel, mapping kolom ke placeholder template, kirim massal via Nodemailer SMTP dengan hasil sent/skipped/failed |
| **Kalender Janji Temu** | FullCalendar dengan 4 tampilan (month/week/day/list), create/edit/detail modal |
| **Mapping Ruangan** | SVG floor plan interaktif dengan kategori ruangan, search/filter, popup info |
| **Rute Ambulans** | Leaflet + OSRM routing, multiple vehicle, animasi kendaraan, drag-drop waypoint |
| **3D Map Rumah Sakit** | Mapbox GL 3D dengan building footprints, marker, info panel |
| **Dark/Light Mode** | `ColorSwitcher.vue` + `useColorMode()` Nuxt UI |
| **Offline Detection** | `useOffline.ts` composable — banner otomatis saat koneksi putus |
| **Custom Error Page** | `error.vue` untuk 404 dan error lainnya dengan desain gradient glassmorphism |
| **Sidebar Collapsible** | Sidebar bisa di-minimize dengan transisi smooth (w-60 ↔ w-16) |
