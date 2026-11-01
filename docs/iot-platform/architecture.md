# ARCHITECTURE DESIGN: MODULAR IOT PLATFORM (PHASE 2)

**Status:** Approved  
**Tanggal:** 01 November 2026  
**Dokumen Referensi:** `docs/iot-platform/audit.md`

---

## 1. Modular IoT Target Architecture

Sistem dirancang dengan arsitektur berlapis (layered & modular architecture):
```
                      ┌──────────────────────────────────────────────┐
                      │              UI Layer (Nuxt 3)               │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
┌─────────────────────────┐                                     ┌─────────────────────────┐
│     MODUL PRESENSI      │                                     │     MODUL IOT SENSOR    │
│  (/iot/presensi)        │                                     │   (/iot/sensor)         │
├─────────────────────────┤                                     ├─────────────────────────┤
│ • Presensi Overview     │                                     │ • Sensor Overview       │
│ • Device Presensi (CRUD)│                                     │ • Device Sensor (CRUD)  │
│ • Rekap Kehadiran (Logs)│                                     │ • Dynamic Parameters    │
│ • Mini-Swagger Presensi │                                     │ • Realtime & Hist Chart │
│ • Tutorial RFID/ESP32   │                                     │ • Mini-Swagger Sensor   │
└────────────┬────────────┘                                     └────────────┬────────────┘
             │                                                               │
             └───────────────────────────────┬───────────────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │           SHARED IOT CORE LAYER              │
                      │  (Registry, Device Auth, Heartbeat, WiFi)    │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│       IotDevice         │     │      IotAttendance      │     │    IotSensorTelemetry   │
│  (Shared Core Registry) │     │ (Presence Transactions) │     │  (Time-series Telemetry)│
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Module Boundary & Directory Structure

### 2.1 Frontend Structure
```
pages/
└── iot/
    ├── index.vue            # Hub / Router pemilihan modul IoT
    ├── presensi/
    │   └── index.vue        # Dedicated Module Presensi IoT
    └── sensor/
        └── index.vue        # Dedicated Module IoT Sensor & Telemetry

components/
└── iot/
    ├── ApiExplorer.vue      # Reusable Mini-Swagger UI
    ├── DeviceStatusBadge.vue# Reusable Online/Offline indicator
    ├── SensorHistoryChart.vue # ECharts time-series line chart
    ├── WifiConfigModal.vue  # Reusable WiFi pool manager
    └── DevicePayloadModal.vue # JSON format inspection modal
```

### 2.2 Backend API Structure
```
server/api/iot/
├── core/
│   ├── devices/index.get.ts     # Filterable by type=presensi|sensor
│   ├── devices/index.post.ts    # Register device with type
│   ├── devices/[id].put.ts      # Update common & specific metadata
│   ├── devices/[id].delete.ts   # Soft/hard delete
│   ├── heartbeat.post.ts        # Common heartbeat (presensi + sensor)
│   ├── device-status.post.ts    # Common status sync
│   └── wifi/*                   # Multi-AP fallback pool
├── presensi/
│   ├── attendance/index.get.ts  # Log presensi
│   ├── attendance/index.post.ts # Manual attendance
│   ├── tap.post.ts              # Endpoint terima tap kartu RFID
│   └── spec.get.ts              # OpenAPI spec for Mini Swagger Presensi
└── sensor/
    ├── telemetry.post.ts        # Ingest multi-parameter reading
    ├── telemetry.get.ts         # Query historical time-series with range
    ├── parameters.put.ts        # Manage dynamic parameter definition
    └── spec.get.ts              # OpenAPI spec for Mini Swagger Sensor
```

---

## 3. Database Schema Design (Tanpa Merusak Data Lama)

1. **`IotDevice` (Shared Core Registry)**:
   - Menampung semua perangkat fisik (`deviceId`, `name`, `type: 'presensi' | 'sensor'`, `location`, `status`, `lastSeen`, `connectedSsid`, `ipAddress`, `rssi`, `firmwareVersion`, `apiKey`).
   - Khusus sensor: menampung array dinamis `sensorConfig: [{ key, name, unit, minThreshold, maxThreshold }]` dan snapshot `latestTelemetry`.

2. **`IotSensorTelemetry` (New Model Time-Series)**:
   - Digunakan khusus oleh Modul Sensor untuk menyimpan data historis:
     ```ts
     {
       deviceId: string (indexed),
       timestamp: Date (indexed),
       data: Record<string, number>, // e.g. { temperature: 24.5, humidity: 60 }
       status: 'normal' | 'warning' | 'danger',
       notes?: string
     }
     ```
   - Dilengkapi compound index `{ deviceId: 1, timestamp: -1 }` untuk query grafik yang cepat tanpa full table scan.

3. **`IotAttendance`**:
   - Tetap dipertahankan 100% untuk modul presensi tanpa breaking change.

---

## 4. API Documentation (Mini-Swagger) Specification
Komponen Mini Swagger (`components/iot/ApiExplorer.vue`) akan mendukung:
- Tabs / Accordion per method (GET, POST, PUT, DELETE).
- Syntax-highlighted JSON Request & Response.
- Header requirements (misal: `Content-Type: application/json`, `X-Device-Id`).
- Fitur **Try It Out** dengan status code badge (200 OK, 400 Bad Request, 401 Unauthorized, 500 Error).
- Masking credential otomatis.

