# AUDIT REPORT: SISTEM IOT & MODUL BISNIS SAAT INI (PHASE 1)

**Tanggal Audit:** 01 November 2026  
**Status:** Selesai (Read-Only Audit)  
**Tujuan:** Menganalisis arsitektur saat ini (Frontend, Backend, Database, Komunikasi Hardware, Routing, Permission, dan Visualisasi) serta merumuskan strategi transisi menuju **Modular IoT Platform** tanpa melakukan full rewrite.

---

## 1. Executive Summary

Sistem e-Health saat ini telah memiliki modul integrasi perangkat IoT dasar yang berpusat di:
- Frontend: Single page monolithic di `pages/iot/index.vue` (~3,280 baris kode).
- Backend: Endpoint di `server/api/iot/*` yang menggabungkan presensi, status perangkat, dan konfigurasi WiFi.
- Database: Tiga model Mongoose aktif: `IotDevice.ts`, `IotAttendance.ts`, dan `IotWifi.ts`.
- Routing & Navigasi: Menu tunggal "Presensi IoT" (`/iot`) di `components/Sidebar.vue` dan `utils/index.ts`.

### Masalah Utama yang Ditemukan (Pain Points):
1. **Monolithic Page (`pages/iot/index.vue`)**: Seluruh logic presensi, CRUD device, CRUD WiFi pool, simulasi RFID, log presensi, tutorial integrasi, dan panduan API menumpuk dalam 1 file raksasa (>3,200 baris) dengan 5+ modal bertumpuk.
2. **Coupling Modul Bisnis**: Meskipun model `IotDevice.ts` telah memiliki field `type: 'presensi' | 'sensor'`, UI dan alur bisnisnya masih tercampur (misalnya ada sisa sensor config dan telemetry di dalam card presensi sebelumnya).
3. **Belum Ada Modul Khusus IoT Sensor**: Fitur monitoring sensor, dinamika parameter (suhu, kelembaban, tekanan, tegangan), grafik historical time-series, dan alert monitoring belum memiliki wadah modul tersendiri.
4. **Dokumentasi API Masih Berupa Modal Statis**: Panduan API developer disajikan dalam modal sederhana tanpa standar OpenAPI / Mini-Swagger interaktif yang mendukung *Try-it-out* terisolasi.
5. **Autentikasi Perangkat Masih Terbuka (Public Bypass)**: Endpoint device di `server/middleware/auth.ts` dibypass tanpa token/device secret header autentikasi (`X-Device-Id`, `X-Device-Token` / API Key).

---

## 2. Audit Struktur Backend & Database

### 2.1 Database Models (Mongoose)

| Model | File Path | Field Utama | Catatan & Analisis |
|---|---|---|---|
| `IotDevice` | `server/models/IotDevice.ts` | `deviceId`, `name`, `type`, `location`, `status`, `lastSeen`, `connectedSsid`, `ipAddress`, `rssi`, `firmwareVersion`, `sensorConfig`, `latestTelemetry`, `isActive`, `notes` | **Kekuatan:** Sudah memiliki schema modular `type` ('presensi' \| 'sensor') serta embedded `sensorConfig` & `latestTelemetry`. <br>**Rekomendasi:** Tambahkan `apiKey` / `deviceSecret` dan `moduleBindings` (atau relasi modul) agar fleksibel digunakan multi-modul. |
| `IotAttendance` | `server/models/IotAttendance.ts` | `deviceId`, `deviceName`, `uid`, `user` (ObjectId ref User), `userName`, `userNip`, `userRole`, `type` ('masuk' \| 'pulang'), `timestamp`, `status`, `connectedSsid`, `notes` | Sudah sangat matang untuk presensi (RFID/UID). Indeks sudah optimal (`deviceId`, `uid`, `type`, `timestamp`). |
| `IotWifi` | `server/models/IotWifi.ts` | `ssid`, `password`, `priority`, `isActive`, `description`, `timeoutMs` | Digunakan bersama oleh device ESP32/Arduino untuk mekanisme Multi-AP Fallback (`GET /api/wifi-config`). |

### 2.2 Endpoint API Backend yang Ada

| Method | Endpoint URL | Fungsi | Autentikasi | Catatan |
|---|---|---|---|---|
| `GET` | `/api/wifi-config` | Multi-AP WiFi pool (di-poll oleh hardware saat boot/fallback) | Public Bypass | Digunakan oleh semua jenis IoT (Presensi & Sensor) |
| `GET` | `/api/iot/devices` | Mengambil daftar semua perangkat IoT | Session Auth (Admin/Staff) | Perlu filter berdasarkan `type` modul (`?type=presensi` atau `?type=sensor`) |
| `POST` | `/api/iot/devices` | Pendaftaran perangkat baru | Session Auth (Admin/Staff) | Menghasilkan/menyimpan `deviceId`, `type`, dsb. |
| `PUT` | `/api/iot/devices/[id]` | Update data perangkat (nama, lokasi, config) | Session Auth (Admin/Staff) | |
| `DELETE`| `/api/iot/devices/[id]` | Hapus perangkat | Session Auth (Admin/Staff) | |
| `GET` | `/api/iot/devices/[id]/data`| Ambil detail payload JSON terstruktur per device | Session Auth (Admin/Staff) | Menampilkan mapping JSON untuk kemudahan developer |
| `POST` | `/api/iot/devices/[id]/ping`| Ping manual / cek koneksi status device | Session Auth (Admin/Staff) | |
| `POST` | `/api/iot/heartbeat` | Hardware mengirim status online, IP, SSID, RSSI | Public Bypass | Harus diamankan dengan Device Secret/Token |
| `POST` | `/api/iot/device-status` | Hardware sync status online/offline | Public Bypass | Heartbeat alternatif |
| `POST` | `/api/iot/device-name` | Hardware mengupdate/mendaftarkan nama device | Public Bypass | |
| `POST` | `/api/iot/presensi` | Menerima tap RFID dari mesin presensi | Public Bypass | Menyimpan record ke `IotAttendance` |
| `GET` | `/api/iot/attendance` | Mengambil log presensi masuk & pulang | Session Auth | Mendukung filter tanggal & pencarian |
| `POST` | `/api/iot/attendance` | Input presensi manual dari web dashboard | Session Auth | Untuk koreksi data pegawai |
| `DELETE`| `/api/iot/attendance/[id]` | Hapus log presensi | Session Auth (Admin) | |
| `GET` | `/api/iot/wifi` | CRUD daftar WiFi pool | Session Auth | |
| `POST` | `/api/iot/wifi` | Tambah SSID baru | Session Auth | |
| `PUT` | `/api/iot/wifi/[id]` | Update SSID | Session Auth | |
| `DELETE`| `/api/iot/wifi/[id]` | Hapus SSID | Session Auth | |

---

## 3. Audit Struktur Frontend & UI/UX

### 3.1 Routing & Pages
- Saat ini: `pages/iot/index.vue` menjadi satu-satunya halaman IoT.
- Kekurangan: Tidak ada pemisahan rute. Jika nantinya fitur sensor ditambah ke halaman yang sama, halaman akan semakin bloated (>5,000 baris) dan UI membingungkan pengguna (staf HR/Presensi tidak butuh melihat grafik suhu/kelembaban cold storage, begitu pula teknisi medis tidak butuh melihat log RFID pegawai).

### 3.2 Navigasi Sidebar (`components/Sidebar.vue` & `utils/index.ts`)
- Menu saat ini:
  - `Presensi IoT` (`/iot`) dengan role: `['admin', 'doctor', 'nurse', 'receptionist']`.
- Rencana Navigasi Modular:
  - **Modul Presensi**: `/iot/presensi` (atau `/presensi`) yang memiliki sub-tab / sub-page (Dashboard Kehadiran, Log Presensi, Integrasi Device Presensi, Mini-Swagger Presensi, Tutorial Presensi).
  - **Modul IoT Sensor**: `/iot/sensor` (Dashboard Sensor Lingkungan/Medis, Parameter Management, Grafik Realtime & Historis, Mini-Swagger Sensor, Tutorial Sensor).

### 3.3 UI Components & Libraries
- Framework: Nuxt 3 (SSR: false, SPA mode).
- UI Kit: `@nuxt/ui` v2.11.1 (berbasis Headless UI & Tailwind CSS) + `Naive UI` + `Flowbite Vue`.
- Charting Libraries yang Sudah Terinstal:
  - `echarts` + `vue-echarts` (Sangat cocok untuk time-series data, zoom slider, dan dynamic updates).
  - `chart.js` + `vue-chartjs`.
  - `@unovis/vue` + `@unovis/ts`.
- Realtime Infrastructure yang Sudah Terinstal:
  - `socket.io` & `socket.io-client` v4.8.3.

---

## 4. Audit Modul Presensi vs Modul IoT Sensor

| Aspek | Modul Presensi | Modul IoT Sensor |
|---|---|---|
| **Objek Bisnis** | Karyawan/Dokter, Jam Masuk, Jam Pulang, Keterlambatan, Shift | Suhu Ruangan, Kelembaban Obat, Tekanan Oksigen, Tegangan Genset |
| **Tipe Perangkat** | RFID Reader (RC522, PN532), Biometrik, Barcode Scanner | DHT22, BME280, DS18B20, PZEM-004T, Sensor Analog 4-20mA |
| **Frekuensi Data** | Event-driven (hanya saat ada pegawai tap kartu) | Periodic streaming / polling (setiap 5 detik - 1 menit) |
| **Penyimpanan Data** | Transaksional (`IotAttendance`) | Time-series telemetry logs (`IotTelemetryLog` terindeks `timestamp`) |
| **Kebutuhan Visualisasi** | Tabel rekap presensi, badge status (Tepat Waktu, Terlambat), KPI hadir | Line Chart interaktif, Multi-parameter overlay, Min/Max/Avg, Range Filter (1h, 24h, 7d) |
| **Kebutuhan API Doc** | Endpoint presensi tap, sync attendance, device heartbeat | Endpoint ingest telemetry, fetch parameters, alert thresholds |

---

## 5. Rencana Transisi Menuju Modular IoT Platform (Tanpa Rewrite)

Agar sistem tidak di-rewrite secara masif dan fitur yang sudah berjalan tetap 100% stabil:

1. **Mempertahankan Core Database `IotDevice`**:
   - Model `IotDevice` yang ada sudah memiliki field `type: 'presensi' | 'sensor'`, `sensorConfig`, dan `latestTelemetry`.
   - Kita cukup memperkaya model ini dengan token autentikasi (`deviceToken` / `apiKey`) dan helper query tanpa merusak schema lama.
2. **Membuat Shared IoT Core**:
   - Shared controller/service untuk: Device Registry, Heartbeat/Online Status Checker, dan WiFi Pool Manager.
   - Modul Presensi dan Modul Sensor mengonsumsi Shared IoT Core yang sama untuk identitas perangkat dan konektivitas dasar.
3. **Pemisahan Halaman Frontend (Modular Sub-routes)**:
   - Buat direktori halaman modular di `pages/iot/`:
     - `pages/iot/presensi/index.vue`: Khusus operasional presensi (Daftar device presensi, Rekap presensi, Mini Swagger Presensi, Tutorial Presensi).
     - `pages/iot/sensor/index.vue`: Khusus sensor medis/lingkungan (Daftar sensor, Parameter builder, Monitoring dashboard, ECharts historical chart, Mini Swagger Sensor, Tutorial Sensor).
     - `pages/iot/index.vue`: Dialihkan menjadi dashboard navigasi modular atau redirect cerdas sesuai modul yang dipilih.
4. **Mini-Swagger / API Explorer Interaktif**:
   - Komponen reusable `components/iot/ApiExplorer.vue` yang dapat menerima spec endpoint dari masing-masing modul (`presensi-api-spec.ts` dan `sensor-api-spec.ts`).
   - Dilengkapi fitur aman: Parameter tester, sample curl/arduino code, masking credential, dan status response viewer.

---

## 6. Kesimpulan & Rekomendasi Audit (Phase 1 Complete)

Audit mengonfirmasi bahwa infrastruktur kode dasar e-Health sudah sangat siap untuk dimodularisasi tanpa perlu menghapus database atau menulis ulang seluruh sistem.

Dengan membagi UI ke dalam sub-modul mandiri dan memanfaatkan shared backend models, kita dapat mencapai arsitektur Modular IoT Platform yang bersih, profesional, dan scalable.

