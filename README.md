# e-Health SIMPRS — Sistem Informasi Manajemen Klinik & Rumah Sakit

> **Sistem Informasi Manajemen Rumah Sakit (SIMPRS) Modern & Terintegrasi**  
> Dibangun menggunakan **Nuxt 3**, **Vue 3**, **MongoDB (Mongoose)**, **Tailwind CSS**, **Nuxt UI**, dan **Socket.IO** untuk notifikasi real-time.

---

## 📋 Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Modul Operasional SIMPRS](#modul-operasional-simprs)
- [Sistem Notifikasi & Keamanan](#sistem-notifikasi--keamanan)
- [Manajemen Profil Pengguna](#manajemen-profil-pengguna)
- [Arsitektur & Optimasi Kinerja](#arsitektur--optimasi-kinerja)
- [Role & Hak Akses (RBAC)](#role--hak-akses-rbac)
- [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
- [Konfigurasi Environment (.env)](#konfigurasi-environment-env)

---

## 🏥 Gambaran Umum

**e-Health SIMPRS** adalah aplikasi Single Page Application (SPA) berbasis web komprehensif yang dirancang untuk mendigitalkan seluruh alur operasional klinik dan rumah sakit. Sistem ini mencakup pendaftaran pasien, antrian poliklinik terintegrasi, electronic medical record (EMR), peresepan obat dan farmasi, manajemen kamar rawat inap (*bed management*), surat rujukan, penagihan & invoice (billing), rute ambulans GIS, pemetaan 3D denah rumah sakit, email blast massal, hingga sistem notifikasi real-time via WebSocket dan email otomatis.

---

## ✨ Fitur Utama

- ⚡ **Antarmuka Responsif & Cepat**: Dibangun dengan Nuxt 3 SPA, Nuxt UI, Tailwind CSS, serta dukungan tema *Dark / Light Mode*.
- 🔔 **Notifikasi Real-time & WebSocket**: Notifikasi lonceng in-app di Navbar dengan sinkronisasi instan melalui Socket.IO dan pengiriman email otomatis.
- 🔐 **Autentikasi & Keamanan Ketat**: NextAuth.js JWT dengan pembagian hak akses (RBAC) 7 peran, proteksi route guard, dan email verifikasi login lengkap dengan deteksi Device, Browser, IP, dan Lokasi.
- 👤 **Halaman Profil Akun Terintegrasi (`/profile`)**: Kustomisasi nama, jabatan/posisi, unit kerja, NIP, no. HP, dan sinkronisasi otomatis email penerima seluruh aktivitas sistem.
- ⚙️ **Pusat Pengaturan Notifikasi (`/settings`)**: CRUD penerima email notifikasi, konfigurasi preferensi jenis alert, dan tombol uji coba pengiriman cepat.
- 🛡️ **Idempotensi & Keandalan Transaksi**: Middleware idempotensi dengan header `Idempotency-Key` untuk mencegah duplikasi data transaksi kritis (pendaftaran, resep, pembayaran).
- 📊 **Visualisasi Data & Grafik**: Tren kunjungan, okupansi bed rawat inap, utilisasi poli, dan analitik performa rumah sakit menggunakan ECharts & Chart.js.
- 🗺️ **Peta GIS & 3D Denah RS**: Rute navigasi ambulans interaktif (Leaflet + OSRM) dan visualisasi gedung 3D IHC Karawang (Mapbox GL).

---

## 🏢 Modul Operasional SIMPRS

1. **Pendaftaran & Rekam Pasien (`/pendaftaran`, `/pasien`)**:
   - Pendaftaran pasien baru/lama, validasi NIK/No. BPJS, pencarian data pasien cepat, dan penerbitan nomor rekam medis otomatis.
2. **Antrian Poliklinik (`/pendaftaran/antrian`, `/poli`)**:
   - Panggilan antrian suara/visual real-time per poli, display monitor antrian publik, dan estimasi waktu tunggu.
3. **Electronic Medical Record / EMR (`/patient-record`, `/emr`)**:
   - Catatan rekam medis dokter/perawat, riwayat diagnosa ICD-10, tindakan medis ICD-9-CM, tanda vital, dan riwayat kunjungan.
4. **Farmasi & Dispensing Obat (`/farmasi`, `/obat`)**:
   - Antrian resep elektronik dari dokter, verifikasi telaah resep, kalkulasi dosis, dan status dispensing obat.
5. **Rawat Inap & Bed Management (`/ranap`)**:
   - Manajemen kamar/bed rawat inap (*Admissions, Transfers, Discharges*), status ketersediaan bed, dan pemantauan pasien rawat.
6. **Rujukan Pasien (`/rujukan`)**:
   - Pembuatan dan pelacakan surat rujukan internal antar-spesialis dan eksternal ke faskes rujukan tingkat lanjut.
7. **Billing & Kasir (`/patient-record/billing`)**:
   - Pembuatan invoice tagihan otomatis (tindakan, obat, administrasi, kamar), integrasi asuransi/BPJS/Tunai, dan cetak kuitansi.
8. **Email Blast Massal (`/admin/email-blast`)**:
   - Pengiriman pengumuman, promosi kesehatan, atau rekrutmen massal dengan template dinamis dan pelacakan progres real-time.
9. **Presensi & Perangkat IoT (`/iot`)**:
   - Monitoring live status hardware mikrokontroler (ON/OFF), deteksi jaringan WiFi terhubung, manajemen Multi-AP pool endpoint (`GET /api/wifi-config`) kompatibel dengan ArduinoJson v7, dan pencatatan presensi masuk/pulang kartu RFID otomatis. Baca dokumentasi lengkap di [`docs/IOT_PRESENSI.md`](docs/IOT_PRESENSI.md).

---

## 🔔 Sistem Notifikasi & Keamanan

Sistem notifikasi e-Health bekerja secara terpadu di tiga tingkatan:
1. **In-App Bell di Navbar**: Menampilkan notifikasi aktif dengan unread counter dan auto-refresh via Socket.IO.
2. **Database Logger (`Notification`)**: Menyimpan seluruh riwayat aktivitas sistem per pengguna / peran / broadcast.
3. **Pemberitahuan Email Otomatis**:
   - **Login & Security Alert**: Dikirim saat terjadi login berhasil atau gagal, memuat rincian:
     - **Status**: Berhasil / Gagal (Alasan)
     - **Waktu**: Format GMT & WIB
     - **IP Address & Lokasi**: IP klien dan deteksi lokasi
     - **Perangkat & Browser**: Sistem operasi, jenis perangkat, dan versi browser
     - **Action Link**: Tombol cepat periksa keamanan & reset password
   - **Operasional Alert**: Panggilan antrian, resep siap ambil, penerimaan rawat inap, status pembayaran billing, dan pengumuman sistem.
   - **Strict Recipient Rule**: Hanya dikirim ke alamat email yang disimpan di **Pengaturan Notifikasi** atau di **Profil Pengguna** (tidak melakukan self-send ke email pengirim).

---

## 👤 Manajemen Profil Pengguna (`/profile`)

Halaman profil memungkinkan pengguna untuk mengelola data akun secara mandiri:
- **Informasi Pribadi & Kepegawaian**: Nama Lengkap, Jabatan/Posisi, Departemen/Unit Kerja, NIP, Nomor HP/WhatsApp.
- **Email Penerima Notifikasi**: Mengubah alamat email utama yang otomatis disinkronkan ke engine notifikasi sistem.
- **Toggle "Terima Semua Notifikasi"**: Mengaktifkan atau menonaktifkan penerimaan email laporan operasional secara real-time.
- **Uji Coba Pengiriman Cepat**: Tombol untuk menguji langsung apakah email profil berhasil menerima pesan dari SMTP server.
- **Keamanan Akun**: Form perubahan kata sandi dengan verifikasi kata sandi saat ini.

---

## 👥 Role & Hak Akses (RBAC)

Sistem menerapkan kontrol akses berbasis peran (*Role-Based Access Control*) pada tingkat frontend dan backend:

| Peran (Role) | Deskripsi | Akses Utama |
|---|---|---|
| `admin` | Administrator Sistem / SIMPRS | Akses penuh ke seluruh menu, pengaturan notifikasi, email blast, dan manajemen user |
| `doctor` | Dokter Spesialis / Dokter Umum | EMR rekam medis, antrian poli, peresepan obat, rujukan, admission/discharge rawat inap |
| `nurse` | Perawat / Bidan | Pendaftaran pasien, tanda vital, antrian poli, monitoring rawat inap, rekam medis |
| `pharmacist` | Apoteker / Petugas Farmasi | Dispensing resep, katalog master obat, telaah obat, stok farmasi |
| `receptionist`| Petugas Pendaftaran / Front Office | Registrasi pasien, antrian loket, jadwal appointment janji temu, rujukan |
| `billing` | Kasir / Staf Keuangan | Manajemen invoice, pembayaran billing, verifikasi klaim tagihan |
| `patient` | Pasien / Pengguna Mandiri | Dashboard riwayat kunjungan pribadi, jadwal janji temu, tagihan invoice mandiri |

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- **Node.js**: v18.x atau v20.x (direkomendasikan v20.x)
- **MongoDB**: v5.0+ (Lokal atau MongoDB Atlas)
- **NPM** atau **PNPM / Yarn**

### Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/HerlambangK/e-Health.git
   cd e-Health
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin atau buat file `.env` di direktori utama:
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Build untuk Produksi**:
   ```bash
   npm run build
   node .output/server/index.mjs
   ```

---

## ⚙️ Konfigurasi Environment (.env)

Berikut contoh parameter konfigurasi yang didukung:

```env
# Koneksi Database
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ehealth?retryWrites=true&w=majority"

# Autentikasi NextAuth
AUTH_SECRET="your-super-secret-jwt-key-32-chars"
AUTH_ORIGIN="http://localhost:3000"

# Pengaturan SMTP Email Pengirim
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="people@sejahterasehatkaryautama.co.id"
SMTP_PASS="your-smtp-app-password"
SMTP_FROM="Rekrutmen PT SSK <people@sejahterasehatkaryautama.co.id>"
SMTP_REPLY_TO="noreply@sejahterasehatkaryautama.co.id"

# Peta Mapbox (Opsional untuk Visualisasi 3D)
MAPBOX_ACCESS_TOKEN="pk.eyJ1IjoieW91ci11c2VyIiwiYSI6InlvdXItdG9rZW4ifQ..."

# Integrasi Eksternal (Opsional)
# SATUSEHAT_BASE_URL="https://api-satusehat.kemkes.go.id"
# SATUSEHAT_CLIENT_ID="your-client-id"
# SATUSEHAT_CLIENT_SECRET="your-client-secret"
# SATUSEHAT_ORG_ID="your-org-id"
```

---

## 📄 Lisensi
Dikelola dan dikembangkan untuk operasional **PT Sejahtera Sehat Karyautama** / **e-Health SIMPRS**.
