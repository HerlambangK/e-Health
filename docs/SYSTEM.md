# e-Health — Sistem Informasi Manajemen Klinik & Rumah Sakit (SIMPRS)

> **Tech Stack:** Nuxt 3 (SPA) · Vue 3 · Tailwind CSS · Nuxt UI · MongoDB + Mongoose · NextAuth.js · Socket.IO · Nodemailer

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Tech Stack & Pustaka Utama](#tech-stack--pustaka-utama)
- [Struktur Proyek Terbaru](#struktur-proyek-terbaru)
- [Role & Hak Akses (RBAC)](#role--hak-akses-rbac)
- [Alur Autentikasi & Keamanan](#alur-autentikasi--keamanan)
- [Sistem Notifikasi & WebSocket](#sistem-notifikasi--websocket)
- [Halaman Profil Pengguna (`/profile`)](#halaman-profil-pengguna-profile)
- [Halaman & Fungsinya](#halaman--fungsinya)
- [API Endpoints](#api-endpoints)
- [Arsitektur & Optimasi Backend](#arsitektur--optimasi-backend)

---

## Gambaran Umum

Aplikasi **e-Health** adalah sistem Single Page Application (SPA) berbasis web komprehensif untuk mengelola operasional klinik dan rumah sakit secara terintegrasi. Mencakup manajemen pendaftaran pasien, antrian poliklinik terhubung, electronic medical record (EMR), resep & dispensing farmasi, manajemen tempat tidur rawat inap (*bed management*), surat rujukan, billing/invoice, mapping ruangan, visualisasi 3D bangunan rumah sakit, rute ambulans, email blast massal, serta sistem notifikasi in-app dan email real-time.

SSR dimatikan (`ssr: false`), rendering berjalan di sisi klien dengan backend API yang di-handle oleh server Nitro Nuxt terhubung ke MongoDB Atlas.

---

## Tech Stack & Pustaka Utama

| Lapisan | Teknologi |
|---|---|
| **Frontend Framework** | Nuxt 3.9.1, Vue 3.3.10, Vue Router 4.2.5 |
| **Komponen & UI** | `@nuxt/ui` 2.11.1, Tailwind CSS 3, Headless UI, Heroicons, Lucide Icons |
| **Real-time / WebSocket** | Socket.IO Server (`server/plugins/socket.ts`) & Socket.IO Client (`composables/useSocket.ts`) |
| **Autentikasi & Session** | `@sidebase/nuxt-auth` 0.6.4 (NextAuth.js v4), JWT Session, Credentials Provider |
| **Database & ODM** | MongoDB + Mongoose 8.0.3 dengan indeks optimal & query `.lean()` |
| **Idempotensi & Transaksi** | Custom Idempotency Key Middleware (`server/middleware/idempotent.ts`) + MongoDB Model |
| **Grafik & Visualisasi** | Apache ECharts (Dynamic Import), Chart.js, Unovis |
| **Kalender & Jadwal** | FullCalendar 6.1.10 (Dynamic Component) |
| **Peta & GIS** | Leaflet + OSRM (Rute Navigasi), Mapbox GL 3D (Gedung & Denah) |
| **Email & Notifikasi** | Nodemailer (SMTP SSL Port 465) + Security Alert Template Engine |
| **Manipulasi File** | `xlsx` (Excel Export/Import), `html2pdf.js` |
| **Validasi Skema** | Zod, h3-zod |

---

## Struktur Proyek Terbaru

```
e-Health/
├── app.vue                            # Root — NuxtLayout, NuxtPage, offline banner
├── error.vue                          # Custom error page (404/500)
├── nuxt.config.ts                     # Konfigurasi Nuxt, Vite chunks, Nitro tasks
├── package.json                       # Dependencies & scripts
├── tailwind.config.ts                 # Tailwind configuration
│
├── components/
│   ├── admin/                         # Overview, AdmissionsTrend, UtilizationOverview, RoomMappingCanvas, navburger
│   ├── antrian/                       # AntrianDisplay (Public Board), AntrianList
│   ├── dashboard/                     # Patient dashboard (history, CollectionActionMenu)
│   ├── emr/                           # DiagnosisSearch, MedicationForm, TindakanSearch, VitalSigns
│   ├── form/                          # Form dokter & pasien
│   ├── homepage/                      # Landing page (header, aboutus, map3d, footer, logoclient)
│   ├── patient/                       # Diagnosis, visit, riwayat
│   ├── ranap/                         # BedMap (Visual Bed), PatientCard
│   ├── satusehat/                     # SyncLog, SyncStatus
│   ├── Wrapper/Auth.vue               # Layout wrapper halaman autentikasi
│   ├── ColorSwitcher.vue              # Toggle dark/light mode
│   ├── Logo.vue                       # Brand logo component
│   ├── Navbar.vue                     # Top navigation bar + In-App Notification Bell & Profile Dropdown
│   └── Sidebar.vue                    # Collapsible sidebar dengan cookie state & tooltips
│
├── composables/
│   ├── useApiCache.ts                 # In-memory client request caching
│   ├── useNotifications.ts            # Reactive singleton notification state & fetcher
│   ├── useOffline.ts                  # Deteksi koneksi internet
│   ├── usePasien.ts                   # CRUD pasien reusable
│   ├── useSidebar.ts                  # Cookie-persisted sidebar collapse state
│   └── useSocket.ts                   # Socket.IO client manager
│
├── layouts/
│   ├── default.vue                    # Layout aplikasi utama (Sidebar + Navbar + Konten)
│   └── home.vue                       # Layout landing page & auth (tanpa sidebar)
│
├── middleware/
│   ├── auth-middleware.ts             # Client route guard — cek login & role permission
│   └── guest.ts                       # Redirect user terautentikasi ke dashboard
│
├── pages/
│   ├── index.vue                      # Landing page publik
│   ├── dashboard.vue                  # Dashboard pasien
│   ├── map.vue                        # Navigasi rute ambulans
│   ├── pendaftaran/                   # Pendaftaran pasien & antrian loket
│   ├── poli/                          # Poliklinik & antrian dokter
│   ├── farmasi/                       # Resep & dispensing obat
│   ├── ranap/                         # Manajemen kamar & rawat inap
│   ├── rujukan/                       # Surat rujukan pasien
│   ├── profile/                       # Profil akun, jabatan, dan sinkronisasi email notifikasi
│   ├── settings/                      # Pengaturan penerima notifikasi & uji coba email
│   ├── auth/                          # Login (signin.vue) & Registrasi (signup.vue)
│   ├── admin/                         # Admin dashboard, email blast, map 3D, room mapping
│   ├── doctor/                        # Master data & jadwal dokter
│   └── patient-record/                # Rekam medis, kalender appointment, billing invoice, export data
│
├── plugins/
│   └── socket.client.ts               # Socket.IO client initialization plugin
│
├── server/
│   ├── api/                           # REST API Endpoints
│   │   ├── admin/                     # Email blast & template
│   │   ├── antrian/                   # Antrian poli, panggil suara, display
│   │   ├── appointment/               # CRUD janji temu
│   │   ├── auth/                      # NextAuth handler + registrasi + security login logger
│   │   ├── billing/                   # CRUD billing kasir
│   │   ├── dashboard/                 # Aggregated summary dashboard
│   │   ├── dokter/                    # Master dokter
│   │   ├── encounter/                 # Kunjungan pasien EMR
│   │   ├── farmasi/                   # Antrian farmasi
│   │   ├── notifications/             # In-app notifications & read markers
│   │   ├── obat/                      # Master obat
│   │   ├── pasien/                    # Master pasien
│   │   ├── penyakit/                  # Master diagnosa penyakit
│   │   ├── profile/                   # User profile get & put handler
│   │   ├── ranap/                     # Rawat inap (admission, bed, discharge)
│   │   ├── rekamedis/                 # Rekam medis EMR
│   │   ├── resep/                     # Resep dokter & dispensing
│   │   ├── rujukan/                   # Rujukan internal & eksternal
│   │   ├── settings/                  # Notification setting CRUD & test notification
│   │   └── tindakan/                  # Master tindakan medis
│   ├── middleware/
│   │   ├── auth.ts                    # RBAC Server-side authorization guard
│   │   ├── idempotent.ts              # Idempotency Key header middleware
│   │   └── logging.ts                 # Request logging
│   ├── models/                        # Mongoose schemas (User, Pasien, Notification, NotificationSetting, IdempotencyKey, dll)
│   ├── plugins/
│   │   ├── mongoose.ts                # Koneksi MongoDB Atlas
│   │   └── socket.ts                  # Socket.IO server engine
│   ├── tasks/                         # Nitro background tasks
│   └── utils/                         # Helper (notify, mailer, idempotency, client-info, generate-id, response)
│
└── utils/
    ├── index.ts                       # Navigasi links, helper tanggal
    └── permissions.ts                 # RBAC role matrix & route access rules
```

---

## Role & Hak Akses (RBAC)

Sistem memiliki **7 Role Pengguna** dengan batasan izin:

| Peran (Role) | Kategori | Hak Akses Utama |
|---|---|---|
| `admin` | Administrator | Akses penuh ke semua fitur, pengaturan notifikasi, profile, email blast, dan manajemen user |
| `doctor` | Medis | EMR rekam medis, antrian poli, peresepan obat, rujukan, admission/discharge rawat inap |
| `nurse` | Medis | Pendaftaran, tanda vital pasien, antrian poli, monitoring rawat inap, rekam medis |
| `receptionist`| Front Office | Registrasi pasien, antrian loket, jadwal janji temu (appointment), surat rujukan |
| `pharmacist` | Farmasi | Resep dokter, dispensing obat, katalog master obat, stok farmasi |
| `billing` | Kasir/Keuangan | Manajemen invoice tagihan, pembayaran kasir, status klaim billing |
| `patient` | Pasien | Dashboard pribadi, riwayat pemeriksaan, jadwal kontrol, invoice tagihan mandiri |

---

## Alur Autentikasi & Keamanan

1. **Login Flow**:
   - Pengguna login via `/auth/signin` (NextAuth Credentials Provider).
   - Server mengekstrak informasi perangkat klien via `server/utils/client-info.ts` (IP, Browser, OS, Device, Lokasi).
   - **Login Berhasil**: Memicu notifikasi `login_success` ke database, Socket.IO, dan mengirimkan email verifikasi keamanan login ke email admin/penerima terdaftar.
   - **Login Gagal**: Memicu notifikasi `login_failed` ke database, Socket.IO, dan mengirimkan email peringatan percobaan login mencurigakan.

2. **Route Guard & API Guard**:
   - **Client**: `middleware/auth-middleware.ts` memeriksa token session dan hak akses peran rute.
   - **Server**: `server/middleware/auth.ts` memverifikasi token JWT dan mencocokkan `mapResource()` serta `hasPermission(role, resource, action)`.

---

## Sistem Notifikasi & WebSocket

- **Real-Time Push**: Socket.IO terpasang di `server/plugins/socket.ts` dan di-consume melalui `composables/useSocket.ts` serta `composables/useNotifications.ts`.
- **Channeling**:
  - `role:<role>`: Notifikasi khusus untuk peran tertentu (misal: antrian poli untuk dokter, resep masuk untuk apoteker).
  - `user:<userId>`: Notifikasi privat untuk pengguna tertentu.
  - `broadcast`: Notifikasi global ke seluruh pengguna online.
- **Email Forwarding (`server/utils/notify.ts`)**:
  - Mengirim email via SMTP SSL Port 465.
  - **Aturan Penerima Ketat**: Notifikasi hanya dikirim ke email yang tersimpan di `NotificationSetting` dan email admin yang tersimpan di profil pengguna (tanpa self-send ke email pengirim).

---

## Halaman Profil Pengguna (`/profile`)

Halaman profil memungkinkan pengguna untuk mengelola data akun secara mandiri:
- **Informasi Pribadi & Kepegawaian**: Nama Akun, Posisi/Jabatan, Unit Kerja/Departemen, NIP, Nomor HP/WhatsApp.
- **Email Penerima Notifikasi Utama**: Mengubah alamat email yang otomatis disinkronkan ke tabel `NotificationSetting`.
- **Toggle Notifikasi**: Memilih apakah akun menerima email notifikasi operasional sistem secara real-time.
- **Uji Coba Kirim Notifikasi**: Mengetes langsung keandalan pengiriman email notifikasi ke alamat profil yang sedang diedit.
- **Keamanan Akun**: Penggantian kata sandi dengan validasi keamanan.

---

## API Endpoints

### 1. Autentikasi & Profil
- `*` `/api/auth/[...]` — NextAuth handler
- `POST` `/api/auth/signup` — Registrasi user baru
- `GET` `/api/user/profile` / `/api/profile` — Mengambil data profil login
- `PUT` `/api/user/profile` / `/api/profile` — Memperbarui profil & sinkronisasi email notifikasi

### 2. Notifikasi & Pengaturan
- `GET` `/api/notifications` — Daftar notifikasi in-app
- `GET` `/api/notifications/unread-count` — Jumlah notifikasi belum dibaca
- `PUT` `/api/notifications/[id]` — Menandai notifikasi telah dibaca
- `POST` `/api/notifications/read-all` — Menandai semua notifikasi telah dibaca
- `GET` `/api/settings/notification-emails` — List penerima email notifikasi
- `POST` `/api/settings/notification-emails` — Tambah penerima email notifikasi
- `PUT` `/api/settings/notification-emails/[id]` — Edit penerima notifikasi
- `DELETE` `/api/settings/notification-emails/[id]` — Hapus penerima notifikasi
- `POST` `/api/settings/test-notification` — Uji coba kirim notifikasi sistem

### 3. Operasional SIMPRS
- `CRUD` `/api/pasien` — Master pasien & pencarian
- `CRUD` `/api/antrian` — Antrian poli & panggil suara
- `CRUD` `/api/encounter` — Kunjungan pasien EMR
- `CRUD` `/api/rekamedis` — Catatan rekam medis
- `CRUD` `/api/resep` — Resep & dispensing obat
- `CRUD` `/api/ranap` — Rawat inap & bed management
- `CRUD` `/api/rujukan` — Surat rujukan
- `CRUD` `/api/billing` — Invoice tagihan kasir
- `CRUD` `/api/appointment` — Kalender janji temu
- `CRUD` `/api/obat`, `/api/dokter`, `/api/penyakit`, `/api/tindakan` — Data master

---

## Arsitektur & Optimasi Backend

1. **Idempotensi Transaksi (`Idempotency-Key`)**:
   - Mencegah *double-billing*, duplikasi pendaftaran, dan duplikasi resep saat jaringan tidak stabil.
   - Respons di-cache dalam koleksi `IdempotencyKey` dengan TTL otomatis 24 jam.

2. **Query Optimization**:
   - Penambahan indeks gabungan (`compound indexes`) pada model MongoDB.
   - Penggunaan query `.lean()` pada endpoint read-only untuk meminimalkan beban memori Node.js.
   - Penggunaan Aggregation Pipeline pada dashboard summary.

3. **Vite Dynamic Chunking**:
   - Pemecahan library besar (ECharts, Mapbox, FullCalendar, XLSX) menjadi chunk terpisah untuk mempercepat *First Contentful Paint* (FCP) dan *Largest Contentful Paint* (LCP).
