# IMPLEMENTATION PLAN: MODULAR IOT PLATFORM (PHASE 3)

**Status:** Ready to Execute  
**Dokumen Referensi:** `docs/iot-platform/architecture.md`

---

## 1. Daftar File yang Akan Dibuat & Diubah

### A. New Models & Backend APIs
1. `server/models/IotSensorTelemetry.ts` (Model time-series log sensor dengan TTL/indexing optimal).
2. `server/api/iot/sensor/telemetry.post.ts` (Endpoint ingest data sensor dinamis).
3. `server/api/iot/sensor/telemetry.get.ts` (Endpoint fetch data historis grafik dengan filter waktu 1h, 24h, 7d).
4. `server/api/iot/sensor/parameters.put.ts` (Endpoint update parameter dinamis sensor).
5. `server/api/iot/presensi/spec.get.ts` (Spec API resmi untuk Mini-Swagger Presensi).
6. `server/api/iot/sensor/spec.get.ts` (Spec API resmi untuk Mini-Swagger Sensor).

### B. Shared Components & UI
1. `components/iot/ApiExplorer.vue` (Komponen Mini-Swagger yang aman, mendukung Try It Out, request body schema, response schema).
2. `components/iot/SensorHistoryChart.vue` (Visualisasi ECharts time-series line chart dinamis sesuai parameter yang dipilih).
3. `components/iot/DevicePayloadModal.vue` (Modal mapping JSON payload per device).

### C. Pages Refactoring
1. `pages/iot/index.vue` (Hub pemilih modul: Card Modul Presensi & Card Modul IoT Sensor, status ringkasan).
2. `pages/iot/presensi/index.vue` (Halaman khusus Presensi IoT: Device presensi, manual tap, rekap kehadiran, tutorial koneksi, Mini-Swagger).
3. `pages/iot/sensor/index.vue` (Halaman khusus IoT Sensor: Device sensor, parameter management, real-time widget, ECharts historis, Mini-Swagger).

### D. Navigation Updates
1. `components/Sidebar.vue` & `utils/index.ts` (Tambahkan navigasi eksplisit untuk Presensi IoT dan IoT Sensor agar mudah diakses langsung).
2. `server/middleware/auth.ts` (Tambahkan endpoint telemetry sensor ke whitelist bypass IoT).

---

## 2. Testing Strategy
1. Jalankan `npm test -- --run` untuk memastikan test suite existing tetap 100% pass.
2. Buat file test baru `tests/iot-modular.test.ts` untuk memverifikasi isolasi data presensi vs sensor.
3. Jalankan `npx nuxi prepare` untuk memverifikasi tipe TypeScript.

