# Arsitektur Modern e-Health SIMPRS

> **Target:** Migrasi dari **monolitik-sederhana** (MongoDB queue + Nitro cron + in-memory cache) ke **arsitektur modern** dengan proper message broker, caching, search engine, dan notifikasi real-time.
>
> **Platform Target:** VPS

---

## Daftar Isi

- [1. Masalah Arsitektur Saat Ini](#1-masalah-arsitektur-saat-ini)
- [2. Arsitektur Target](#2-arsitektur-target)
- [3. Kenapa Teknologi Ini?](#3-kenapa-teknologi-ini)
- [4. Docker Compose Full Setup](#4-docker-compose-full-setup)
- [5. Nginx Reverse Proxy & SSL](#5-nginx-reverse-proxy--ssl)
- [6. RabbitMQ — Desain Queue & Worker](#6-rabbitmq--desain-queue--worker)
- [7. Redis — Caching, Session & Pub/Sub](#7-redis--caching-session--pubsub)
- [8. Elasticsearch — Search Engine](#8-elasticsearch--search-engine)
- [9. Notifikasi Real-time](#9-notifikasi-real-time)
- [10. Email Blast — Optimasi Penuh](#10-email-blast--optimasi-penuh)
- [11. Security Hardening VPS](#11-security-hardening-vps)
- [12. Estimasi Resource](#12-estimasi-resource)
- [13. Checklist Migrasi](#13-checklist-migrasi)

---

## 1. Masalah Arsitektur Saat Ini

### 1.1 Kondisi Sekarang

```
┌──────────────────────────────────────────────────────┐
│              Nuxt 3 App (Single Process)             │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Nitro    │  │ MongoDB Job  │  │ Nitro Cron    │  │
│  │ API      │  │ Queue (file) │  │ Tasks (30s)   │  │
│  │ Server   │  │              │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ In-Mem   │  │ Nodemailer   │  │ Console       │  │
│  │ Token    │  │ (fire-and-   │  │ Logging       │  │
│  │ Cache    │  │  forget)     │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │              MongoDB Atlas                     │    │
│  │  (Database + Queue + Search + Logs)           │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 1.2 Masalah Spesifik

| Masalah | File Terkait | Dampak |
|---------|-------------|--------|
| **MongoDB sebagai queue** — tidak ada dead letter, ack, atau retry mekanisme yang robust | `server/jobs/queue.ts` | Job bisa hilang/silent-fail tanpa diketahui |
| **Nitro cron terikat server** — jika server restart saat cron berjalan, job hang | `server/tasks/satusehat-sync.ts`, `retry-failed-sync.ts`, `bpjs-klaim.ts`, `sinoap-laporan.ts` | Tidak fault-tolerant, tidak bisa scale multi-instance |
| **In-memory FHIR token cache** — hilang saat server restart, tidak bisa share antar instance | `server/fhir/client.ts` | Setiap restart harus auth ulang ke SatuSehat [OAuth2 overhead] |
| **MongoDB text index untuk ICD search** — lambat di data besar, tidak ada typo tolerance, tidak bisa fuzzy search | `server/models/ICD10.ts` | User salah ketik 1 huruf → 0 hasil |
| **Email blast fire-and-forget** — tidak ada checkpoint, progress lost saat crash, tidak ada rate limiting yang proper | `server/api/admin/email-blast.post.ts` | Campaign gagal di tengah harus restart dari awal |
| **Tidak ada notifikasi real-time** — pasien tidak tahu kapan dipanggil kecuali lihat display board | `server/api/antrian/display.get.ts` | UX buruk, harus polling terus |
| **Logging console-based** — tidak terpusat, tidak searchable, hilang saat restart | `server/middleware/logging.ts` | Debugging sulit, tidak ada audit trail |

### 1.3 Contoh Kegagalan Nyata

**Skenario 1: FHIR Sync Failure**
```
Pasien didaftarkan → triggerFHIRSync() → enqueue("satusehat-sync")
→ processQueue() → panggil SatuSehat API → timeout (30s)
→ catch error → simpan ke SyncLog.failed → retry 5x → PERMANENT FAIL
→ Admin tidak tahu kecuali buka halaman SyncLog manual
```

**Skenario 2: Email Blast Crash**
```
Admin upload 5000 kandidat → runBlast() → kirim 300 email
→ Server restart (deploy baru / OOM) → PROGRESS HILANG
→ Campaign status stuck "running" → admin harus cancel & restart dari 0
```

---

## 2. Arsitektur Target

### 2.1 Diagram Arsitektur Penuh

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              VPS (Docker Host)                                │
│                                                                              │
│  ┌────────────────────────────┐         ┌────────────────────────────┐       │
│  │       Nginx (Port 80/443)  │         │       Let's Encrypt        │       │
│  │  - Reverse Proxy           │         │       (Certbot SSL)        │       │
│  │  - Rate Limiting           │         └────────────────────────────┘       │
│  │  - Static Files (/app)     │                                              │
│  └──────┬─────────────────────┘                                              │
│         │ HTTPS                                                              │
│    ┌────▼─────────────────────────────────────────────────────────┐          │
│    │              Nuxt 3 App Container (Node.js)                    │          │
│    │                                                                │          │
│    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │          │
│    │  │ Nitro API    │  │ Redis Client │  │ RabbitMQ         │    │          │
│    │  │ Server       │  │ (cache,      │  │ Publisher        │    │          │
│    │  │              │  │  session,    │  │                  │    │          │
│    │  │              │  │  pub/sub)    │  │                  │    │          │
│    │  └──────────────┘  └──────────────┘  └────────┬─────────┘    │          │
│    │                                                │               │          │
│    │  ┌──────────────┐  ┌──────────────┐            │               │          │
│    │  │ Elasticsearch│  │ Mongoose      │            │               │          │
│    │  │ Client       │  │ (CRUD only)  │            │               │          │
│    │  └──────────────┘  └──────────────┘            │               │          │
│    └────────────────────────────────────────────────┼───────────────┘          │
│                                                     │                          │
│  ┌──────────────────────────────────────────────────┼─────────────────────┐    │
│  │                  Docker Internal Network (bridge) │                     │    │
│  │                                                  │                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────▼──────┐            │    │
│  │  │ Redis 7  │  │ RabbitMQ │  │ Elastc-  │  │  Workers   │            │    │
│  │  │          │  │ 3.x      │  │ search   │  │  (PM2)     │            │    │
│  │  │ :6379    │  │ :5672    │  │ :9200    │  │            │            │    │
│  │  │          │  │ :15672   │  │          │  │ - satsht   │            │    │
│  │  │ Session  │  │ (mgmt)   │  │ :5601    │  │ - bpjs     │            │    │
│  │  │ Cache    │  │          │  │ (Kibana) │  │ - email    │            │    │
│  │  │ Pub/Sub  │  │ DLQ      │  │          │  │ - sinoap   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘            │    │
│  │                                                                       │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────┐                                        │
│  │  MongoDB Atlas (Cloud/External)  │                                        │
│  │  - Data storage only             │                                        │
│  │  - Change Streams → ES sync      │                                        │
│  └──────────────────────────────────┘                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flow Request ke Response (Full Path)

```
                        USER REQUEST
                             │
                             ▼
                    ┌─────────────────┐
                    │   Nginx :443     │  ← SSL termination
                    │   Rate limit check│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Nuxt SPA       │  ← / (static files)
                    │  (Vue 3)        │
                    └────────┬────────┘
                             │ $fetch("/api/pasien")
                    ┌────────▼────────┐
                    │  Nitro API      │
                    │  Middleware:     │
                    │  1. logging ←───┼──→ Elasticsearch (audit log)
                    │  2. auth ←──────┼──→ Redis (session check)
                    │  3. rate limit ─┼──→ Redis (counter)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────────┐
        │ MongoDB  │ │ Redis    │ │ Elasticsearch    │
        │ CRUD     │ │ Cache    │ │ Search (ICD/     │
        │ (data)   │ │ (token,  │ │  pasien/         │
        │          │ │  dashbrd)│ │  rekamedis)      │
        └──────────┘ └──────────┘ └──────────────────┘
```

### 2.3 Flow Background Job

```
    API Handler (Create/Update)
           │
           │ triggerFHIRSync(resource, action, data)
           ▼
    ┌──────────────────────┐
    │ RabbitMQ Publisher   │
    │ publish(exchange,    │
    │   routingKey, msg)   │
    └──────────┬───────────┘
               │
    ┌──────────▼───────────┐
    │ RabbitMQ Exchange    │
    │ "ehealth.sync"       │
    └──────┬───────┬───────┘
           │       │
    ┌──────▼──┐ ┌──▼──────┐
    │ Queue:  │ │ Queue:  │
    │ patient │ │ encntr  │
    └────┬────┘ └───┬─────┘
         │          │
    ┌────▼──────────▼────┐
    │ satusehat.worker   │
    │ 1. Parse message   │
    │ 2. Map → FHIR      │
    │ 3. Call API        │
    │ 4. Update SyncLog  │
    │    ┌─ Success → Ack│
    │    └─ Fail → Nack  │
    └────────┬───────────┘
             │ (fail)
    ┌────────▼───────────┐
    │ Dead Letter Queue  │
    │ (setelah 5x retry) │
    └────────┬───────────┘
             │
    ┌────────▼───────────┐
    │ Notifikasi Admin   │
    │ (Redis Pub/Sub →   │
    │  In-App / Email)   │
    └────────────────────┘
```

---

## 3. Kenapa Teknologi Ini?

### 3.1 Kenapa RabbitMQ (bukan MongoDB queue)?

| MongoDB Queue (sekarang) | RabbitMQ |
|---------------------------|----------|
| Job disimpan di collection, di-query manual | Job dikirim via TCP, broker yang manage |
| Tidak ada **acknowledgement** — job hilang jika worker crash | **Manual ack** — worker ack setelah sukses, jika crash job kembali ke queue |
| Tidak ada **dead letter queue** — job gagal permanen hilang | **DLQ built-in** — setelah max retry, masuk DLQ untuk inspeksi manual |
| Retry logic custom di `queue.ts:72` — sederhana, tidak ada backoff policy | **Exponential backoff** — 1m, 5m, 15m, 30m, 1h via `x-delayed-message` |
| Polling-based — worker query terus menerus ke MongoDB | **Push-based** — broker push ke worker, latency rendah |
| Tidak bisa prioritas queue | **Priority queue** — bisa set prioritas per message |
| Scaling: gabisa multi-worker untuk queue yang sama (race condition) | **Consumer group** — banyak worker bisa consume dari 1 queue tanpa overlap |
| Monitoring: tidak ada | **Management UI** di port 15672 |

**Kesimpulan:** RabbitMQ memberikan **guaranteed delivery**, **retry mechanism standar**, dan **monitoring** yang tidak bisa dicapai dengan MongoDB queue.

### 3.2 Kenapa Redis (bukan in-memory variable)?

| In-Memory Variable (sekarang) | Redis |
|-------------------------------|-------|
| `let cachedToken: TokenData | null = null` di file | Redis key dengan TTL |
| Hilang saat server restart | **Persistent** (append-only file) |
| Tidak bisa share antar instance (scale horizontal) | **Shared cache** — semua instance baca key yang sama |
| Token expired tidak bisa auto-refresh | **EXPIRE** — auto delete saat TTL habis |
| Tidak ada atomic operation | **INCR/DECR** atomic — cocok untuk rate limiting |
| Rate limiting: tidak ada | **Rate limiter** — key + TTL + counter |

**Kesimpulan:** Redis memungkinkan **shared caching**, **rate limiting**, dan **pub/sub real-time** yang tidak mungkin dengan in-memory variable.

### 3.3 Kenapa Elasticsearch (bukan MongoDB text index)?

| MongoDB Text Index (sekarang) | Elasticsearch |
|-------------------------------|---------------|
| `db.icd10s.createIndex({ searchText: "text" })` | Inverted index dengan analyzer |
| Hanya exact + stemmed match | **Fuzzy match** — typo 1-2 huruf tetap ketemu |
| Tidak ada autocomplete/suggest | **Completion suggester** — search-as-you-type |
| Tidak bisa aggregate hasil search dengan metric | **Aggregation pipeline** — count by category, histogram, dll |
| Lambat untuk >100k dokumen | Dioptimalkan untuk full-text di milyaran dokumen |
| Tidak bisa search lintas koleksi | **Multi-index search** — search pasien + rekamedis + icd sekaligus |
| Tidak ada highlight | **Highlight** — tampilkan kata yang match di hasil |

**Contoh nyata:**
```
User search: "hipertensi"  → MongoDB: "hipretensi" → 0 hasil
                           → Elasticsearch: "hipretensi" → "hipertensi" (fuzzy match)
```

**Kesimpulan:** Elasticsearch diperlukan untuk search experience yang baik, terutama untuk rekam medis dan ICD lookup yang adalah core workflow dokter.

### 3.4 Kenapa Notifikasi Real-time (WebSocket + Redis Pub/Sub)?

**Kondisi sekarang:**
```
Pasien di antrian → dokter panggil → status antrian update di MongoDB
→ pasien harus REFRESH browser untuk lihat status baru
→ atau admin display board polling GET /api/antrian/display tiap 5 detik
```

**Masalah:** Polling = request HTTP setiap 5 detik × N client = boros bandwidth, latency tinggi.

**Dengan Pub/Sub:**
```
Dokter panggil → API update MongoDB → publish "antrian:POLI-001" ke Redis
→ Redis broadcast ke semua subscriber → Socket.IO push ke client
→ Pasien langsung lihat nama dipanggil (real-time, <100ms)
```

### 3.5 Kenapa Pindah dari Vercel ke VPS?

| Vercel (sekarang) | VPS + Docker |
|-------------------|--------------|
| Function timeout 60s (Pro) | **No timeout** — worker bisa jalan berjam-jam |
| Tidak bisa run persistent process | **PM2/Docker** — worker process 24/7 |
| Tidak support WebSocket | **Nginx + Socket.IO** — native WebSocket support |
| Tidak bisa run Redis/RabbitMQ/ES | **Docker Compose** — semua service dalam 1 VPS |
| Cold start untuk fungsi yang jarang dipakai | **Always warm** — semua service selalu running |
| Pricing per request/bandwidth | **Fixed cost** bulanan |

**Kesimpulan:** VPS diperlukan untuk menjalankan **background worker**, **WebSocket**, dan **message broker** yang tidak kompatibel dengan serverless.

---

## 4. Docker Compose Full Setup

### 4.1 File `docker-compose.yml`

```yaml
version: "3.8"

services:
  # =============================================================
  # Nuxt 3 App
  # =============================================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ehealth-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"

  # =============================================================
  # Redis 7 — Cache, Session, Pub/Sub
  # =============================================================
  redis:
    image: redis:7-alpine
    container_name: ehealth-redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    ports:
      - "127.0.0.1:6379:6379"          # bind ke localhost saja
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # =============================================================
  # RabbitMQ 3.x — Message Broker + Management UI
  # =============================================================
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: ehealth-rabbitmq
    restart: unless-stopped
    hostname: ehealth-rabbit
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS}
      RABBITMQ_DEFAULT_VHOST: ehealth
    ports:
      - "127.0.0.1:5672:5672"          # AMQP — bind ke localhost
      - "127.0.0.1:15672:15672"        # Management UI — localhost
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./server/rabbitmq/definitions.json:/etc/rabbitmq/definitions.json
      - ./server/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "rabbitmqctl", "status"]
      interval: 30s
      timeout: 10s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # =============================================================
  # Elasticsearch 8.x — Search Engine
  # =============================================================
  elasticsearch:
    image: elasticsearch:8.11.0
    container_name: ehealth-elastic
    restart: unless-stopped
    environment:
      discovery.type: single-node
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
      xpack.security.enabled: "false"       # internal network, no auth needed
    ports:
      - "127.0.0.1:9200:9200"          # REST API — localhost
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "curl -s http://localhost:9200/_cluster/health | grep -q 'green\|yellow'"]
      interval: 30s
      timeout: 10s
      retries: 10
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
    ulimits:
      memlock:
        soft: -1
        hard: -1

  # =============================================================
  # Kibana — Elasticsearch Dashboard (opsional)
  # =============================================================
  kibana:
    image: kibana:8.11.0
    container_name: ehealth-kibana
    restart: unless-stopped
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "127.0.0.1:5601:5601"          # Dashboard — localhost
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # =============================================================
  # Worker Processes — Background Job Consumers
  # =============================================================
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: ehealth-worker
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # =============================================================
  # Nginx — Reverse Proxy + SSL
  # =============================================================
  nginx:
    image: nginx:alpine
    container_name: ehealth-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
      - ./public:/app  # static SPA files
    depends_on:
      - app
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: "0.25"

networks:
  app-network:
    driver: bridge

volumes:
  redis_data:
    driver: local
  rabbitmq_data:
    driver: local
  es_data:
    driver: local
```

### 4.2 Kenapa Konfigurasi Ini?

**`ports` di-bind ke `127.0.0.1`** — semua service internal (Redis, RabbitMQ, Elasticsearch, Kibana) hanya bisa diakses dari localhost VPS. Tidak ada celah ke internet. Hanya Nginx yang expose port 80/443.

**`healthcheck`** — setiap service punya health check sehingga Docker bisa menentukan urutan start yang benar. `depends_on: condition: service_healthy` memastikan service upstream sudah siap sebelum downstream mulai.

**`maxmemory-policy allkeys-lru`** — Redis akan auto-evict key yang paling jarang dipakai jika memory penuh. Ini mencegah OOM crash.

**`ES_JAVA_OPTS: "-Xms512m -Xmx512m"`** — membatasi memory Elasticsearch agar tidak makan semua RAM VPS.

---

## 5. Nginx Reverse Proxy & SSL

### 5.1 `nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # Rate limiting zone
    limit_req_zone  $binary_remote_addr  zone=api:10m   rate=30r/s;
    limit_req_zone  $binary_remote_addr  zone=auth:10m  rate=5r/m;

    # Gzip untuk static files
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    include /etc/nginx/conf.d/*.conf;
}
```

### 5.2 `nginx/conf.d/ehealth.conf`

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name ehealth.rs-sehat.id;  # ganti dengan domain kamu
    server_tokens off;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ehealth.rs-sehat.id;
    server_tokens off;

    # SSL Certificates
    ssl_certificate     /etc/letsencrypt/live/ehealth.rs-sehat.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ehealth.rs-sehat.id/privkey.pem;

    # Modern SSL config
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # add_header Content-Security-Policy "default-src 'self';" always;

    # Static files (SPA)
    location / {
        root /app;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API → Nuxt App
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }

    # WebSocket → Nuxt App (untuk notifikasi real-time)
    location /socket.io/ {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;  # WebSocket long-lived
    }

    # Auth rate limit
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # RabbitMQ Management (internal, via SSH tunnel)
    # Tidak diexpose ke internet
}
```

### 5.3 Kenapa Konfigurasi Ini?

**Rate limiting di `/api/auth/`** — mencegah brute-force login. 5 request per menit per IP. Lebih dari itu → 429 Too Many Requests.

**Rate limiting di `/api/`** — mencegah abuse API. 30 request per detik dengan burst 50.

**WebSocket di `/socket.io/`** — `proxy_read_timeout 86400s` (24 jam) agar koneksi WebSocket tidak diputus Nginx.

**RabbitMQ Management UI tidak diexpose** — hanya bisa diakses via SSH tunnel. Ini adalah best practice keamanan.

---

## 6. RabbitMQ — Desain Queue & Worker

### 6.1 Topologi Exchange & Queue

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RabbitMQ VHost: ehealth                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Exchange: ehealth.sync (type: topic)                              │  │
│  │ Routing keys:                                                     │  │
│  │   satusehat.patient.created     satusehat.patient.updated         │  │
│  │   satusehat.encounter.created   satusehat.encounter.updated       │  │
│  │   satusehat.condition.created                                     │  │
│  │   satusehat.procedure.created                                     │  │
│  │   satusehat.medication.created                                    │  │
│  │                                                                   │  │
│  │  ┌─────────────────────┐    ┌─────────────────────┐               │  │
│  │  │ Queue:              │    │ Queue:              │               │  │
│  │  │ satusehat.patient   │    │ satusehat.encounter │               │  │
│  │  │ Binding:            │    │ Binding:            │               │  │
│  │  │ satusehat.patient.* │    │ satusehat.encounter.*│              │  │
│  │  └─────────┬───────────┘    └─────────┬───────────┘               │  │
│  │            │                          │                            │  │
│  │  ┌─────────▼───────────┐    ┌─────────▼───────────┐               │  │
│  │  │ DLQ:                │    │ DLQ:                │               │  │
│  │  │ satusehat.patient   │    │ satusehat.encounter │               │  │
│  │  │ .dlq                │    │ .dlq                │               │  │
│  │  └─────────────────────┘    └─────────────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Exchange: ehealth.scheduled (type: x-delayed-message)            │  │
│  │                                                                   │  │
│  │  Queue: bpjs.klaim.scheduled    ← delay: 02:00 Jakarta time       │  │
│  │  Queue: sinoap.report.scheduled ← delay: 08:00 1st-of-month       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Exchange: ehealth.notification (type: fanout)                     │  │
│  │                                                                   │  │
│  │  Queue: email.blast              ← worker email blast             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Kenapa `topic` exchange?

**Topic exchange** memungkinkan routing berdasarkan pattern, bukan exact match. Contoh:
- `satusehat.patient.#` → semua message tentang patient (create, update, delete)
- `satusehat.#.created` → semua create event (patient, encounter, condition)

Ini memberi fleksibilitas untuk menambah queue baru nanti tanpa mengubah publisher.

### 6.3 Kenapa `x-delayed-message` exchange?

Untuk mengganti **Nitro cron tasks**. Daripada cron check setiap 30 detik (boros), kita schedule message dengan delay:

```typescript
// Sebelum: Nitro cron tiap 30 detik
// cron: "*/30 * * * * *" → polling SyncLog table

// Setelah: Schedule message dengan delay
await channel.publish("ehealth.scheduled", "bpjs.klaim", msg, {
  headers: { "x-delay": calculateDelayToTarget("02:00") }
})
```

Worker hanya jalan saat ada message, bukan terus-menerus polling.

### 6.4 `server/rabbitmq/connection.ts`

```typescript
import amqp, { Channel, Connection } from "amqplib"

let connection: Connection | null = null
let channel: Channel | null = null

export async function getRabbitMQChannel(): Promise<Channel> {
  if (channel) return channel

  const config = useRuntimeConfig()
  const url = `amqp://${config.rabbitmqUser}:${config.rabbitmqPass}@${config.rabbitmqHost}:5672/ehealth`

  connection = await amqp.connect(url)
  channel = await connection.createChannel()

  // Setup exchanges
  await channel.assertExchange("ehealth.sync", "topic", { durable: true })
  await channel.assertExchange("ehealth.scheduled", "x-delayed-message", {
    durable: true,
    arguments: { "x-delayed-type": "topic" }
  })
  await channel.assertExchange("ehealth.notification", "fanout", { durable: true })

  connection.on("close", () => { channel = null; connection = null })
  return channel
}
```

**Kenapa singleton pattern?** Sama seperti MongoDB connection (`server/plugins/mongoose.ts`), koneksi RabbitMQ mahal untuk dibuat berulang-ulang. Satu persistent connection cukup.

### 6.5 `server/rabbitmq/publishers/satusehat.publisher.ts`

```typescript
import { getRabbitMQChannel } from "../connection"

interface SyncMessage {
  action: "create" | "update" | "delete"
  resourceType: "Patient" | "Encounter" | "Condition" | "Procedure" | "MedicationRequest"
  resourceId: string
  payload: Record<string, unknown>
  attempt: number
}

export async function publishFHIRSync(msg: SyncMessage): Promise<void> {
  const channel = await getRabbitMQChannel()
  const routingKey = `satusehat.${msg.resourceType.toLowerCase()}.${msg.action}`

  channel.publish(
    "ehealth.sync",
    routingKey,
    Buffer.from(JSON.stringify(msg)),
    {
      persistent: true,        // survive broker restart
      contentType: "application/json",
      messageId: `${msg.resourceType}-${msg.resourceId}-${Date.now()}`,
    }
  )
}
```

**Kenapa `persistent: true`?** Message akan ditulis ke disk di RabbitMQ. Jika broker restart, message tidak hilang. Ini critical untuk FHIR sync yang **tidak boleh hilang**.

### 6.6 `server/workers/satusehat.worker.ts`

```typescript
import amqp from "amqplib"
import { processSyncJob } from "../jobs/satusehat.job"

const MAX_RETRY = 5
const RETRY_DELAYS = [60_000, 300_000, 900_000, 1_800_000, 3_600_000] // 1m, 5m, 15m, 30m, 1h

async function startWorker() {
  const config = useRuntimeConfig()
  const conn = await amqp.connect(
    `amqp://${config.rabbitmqUser}:${config.rabbitmqPass}@${config.rabbitmqHost}:5672/ehealth`
  )
  const channel = await conn.createChannel()

  // Prefetch: max 1 message per worker (jaga rate ke SatuSehat API)
  channel.prefetch(1)

  const queues = [
    "satusehat.patient",
    "satusehat.encounter",
    "satusehat.condition",
    "satusehat.procedure",
    "satusehat.medication",
  ]

  for (const queue of queues) {
    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: "ehealth.sync.dlq",
      deadLetterRoutingKey: `${queue}.dlq`,
    })
    // Bind ke exchange
    await channel.bindQueue(queue, "ehealth.sync", `${queue}.*`)

    await channel.consume(queue, async (msg) => {
      if (!msg) return

      const data = JSON.parse(msg.content.toString())
      const retryCount = (msg.properties.headers?.["x-retry-count"] || 0) as number

      try {
        // Proses sync ke SatuSehat
        await processSyncJob(data)

        // Sukses → ack
        channel.ack(msg)
      } catch (error) {
        if (retryCount < MAX_RETRY) {
          // Retry dengan delay
          const delay = RETRY_DELAYS[retryCount] || 3_600_000

          // Publish ulang dengan header retry count +1
          channel.publish("ehealth.sync", msg.fields.routingKey, msg.content, {
            persistent: true,
            headers: { "x-retry-count": retryCount + 1, "x-delay": delay },
          })
          channel.ack(msg) // ack original message (kita sudah republish)
        } else {
          // Max retry → reject → masuk DLQ
          channel.nack(msg, false, false)
        }
      }
    })
  }

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    await channel.close()
    await conn.close()
  })
}

startWorker()
```

**Kenapa `prefetch(1)`?** Membatasi worker hanya ambil 1 message dalam satu waktu. Ini penting untuk **rate limiting** ke SatuSehat API yang punya rate limit sendiri. Tanpa ini, worker bisa spam ribuan request.

**Kenapa retry dengan delay yang naik (exponential backoff)?** Jika SatuSehat API sedang down, kita tidak mau terus retry setiap 5 detik dan membanjiri mereka. Delay 1m → 5m → 15m → 30m → 1h memberikan waktu recovery.

**Kenapa ada DLQ?** Setelah 5x gagal, job tidak akan retry lagi. Tapi juga tidak hilang — masuk ke Dead Letter Queue. Admin bisa inspect via RabbitMQ Management UI dan manual retry atau delete.

### 6.7 `server/workers/bpjs.worker.ts` — Scheduled Job

```typescript
// Menggantikan server/tasks/bpjs-klaim.ts

async function startBPJSWorker() {
  // ... connection setup ...

  await channel.assertQueue("bpjs.klaim.scheduled", {
    durable: true,
    deadLetterExchange: "ehealth.sync.dlq",
  })
  await channel.bindQueue("bpjs.klaim.scheduled", "ehealth.scheduled", "bpjs.klaim")

  await channel.consume("bpjs.klaim.scheduled", async (msg) => {
    const submited = await submitPendingClaims(50) // max 50 klaim
    if (submited > 0) {
      channel.ack(msg)
      // Schedule berikutnya
      scheduleNextBPJSJob(channel)
    }
  })
}

function scheduleNextBPJSJob(channel: Channel) {
  const now = new Date()
  const next2AM = new Date(now)
  next2AM.setHours(2, 0, 0, 0)
  if (next2AM <= now) next2AM.setDate(next2AM.getDate() + 1)

  const delay = next2AM.getTime() - now.getTime()

  channel.publish("ehealth.scheduled", "bpjs.klaim", Buffer.from("{}"), {
    headers: { "x-delay": delay },
  })
}
```

**Kenapa schedule message daripada cron?** Cron harus polling setiap X detik. Scheduled message hanya consume resource saat waktunya tiba.

---

## 7. Redis — Caching, Session & Pub/Sub

### 7.1 Konfigurasi Redis Client

```typescript
// server/plugins/redis.ts — Nitro plugin (seperti mongoose.ts)
import { createClient } from "redis"

let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (redisClient?.isOpen) return redisClient

  const config = useRuntimeConfig()
  redisClient = createClient({
    socket: {
      host: config.redisHost,     // "ehealth-redis" (docker service name)
      port: config.redisPort,     // 6379
    },
    password: config.redisPassword,
  })

  redisClient.on("error", (err) => console.error("Redis error:", err))
  await redisClient.connect()
  return redisClient
}

// Nitro plugin lifecycle
export default defineNitroPlugin(async () => {
  await getRedisClient()
})
```

### 7.2 Session Store — Ganti JWT-in-cookie → Redis Session

```typescript
// server/api/auth/[...].ts — NextAuth config dengan Redis session
import { Redis } from "@upstash/redis" // atau ioredis

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },
  // ...
})
```

**Kenapa tetap JWT tapi disimpan di Redis?** JWT token tetap dipakai untuk transport. Tapi Redis menyimpan **session state yang bisa di-revoke**. Jika admin menonaktifkan user, kita bisa hapus session dari Redis → user langsung logout, tidak perlu nunggu JWT expired.

### 7.3 FHIR Token Cache

```typescript
// server/fhir/client.ts — Redis-backed token cache

interface TokenCache {
  accessToken: string
  expiresAt: number
}

const TOKEN_KEY = "fhir:satushat:token"
const TOKEN_TTL = 3500 // 58 menit (token Valid 60 menit, buffer 2 menit)

export async function getCachedToken(): Promise<TokenCache | null> {
  const redis = await getRedisClient()
  const raw = await redis.get(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function setCachedToken(token: TokenCache): Promise<void> {
  const redis = await getRedisClient()
  await redis.setEx(TOKEN_KEY, TOKEN_TTL, JSON.stringify(token))
}

export async function getAccessToken(): Promise<string> {
  // Cek cache dulu
  const cached = await getCachedToken()
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.accessToken
  }

  // Cache miss → request baru ke SatuSehat
  const token = await requestNewToken()
  await setCachedToken(token)
  return token.accessToken
}
```

**Kenapa pakai cache?** SatuSehat OAuth2 token valid 60 menit. Tanpa cache, setiap request API yang butuh FHIR sync akan request token baru → puluhan request OAuth2 yang tidak perlu per menit.

**Kenapa bukan in-memory variable?** Dengan Redis, token dishare ke semua worker. Worker juga bisa pakai token yang sama tanpa request ulang.

### 7.4 Rate Limiting Middleware

```typescript
// server/middleware/rate-limit.ts
import { getRedisClient } from "../plugins/redis"

interface RateLimitConfig {
  windowMs: number    // e.g. 60000 (1 menit)
  max: number         // e.g. 30 request
  key?: string        // custom key generator
}

export async function checkRateLimit(
  event: any,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = await getRedisClient()
  const ip = getRequestIP(event)
  const key = config.key
    ? `ratelimit:${config.key}:${ip}`
    : `ratelimit:global:${ip}`

  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000))
  }

  return {
    allowed: current <= config.max,
    remaining: Math.max(0, config.max - current),
  }
}
```

**Kenapa pakai `INCR`?** `INCR` di Redis adalah **atomic operation**. Tidak ada race condition. Jika 100 request datang bersamaan, counter tetap akurat. Tanpa Redis, implementasi dengan variable JavaScript akan race.

### 7.5 Pub/Sub — Antrian Real-time

```typescript
// server/api/antrian/panggil.post.ts — saat dokter panggil pasien

// 1. Update status di MongoDB
await Antrian.findByIdAndUpdate(body.antrianId, {
  status: "called",
  panggilAt: new Date(),
})

// 2. Publish ke Redis → broadcast ke semua client
const redis = await getRedisClient()
const antrian = await Antrian.findById(body.antrianId)
await redis.publish(
  `antrian:${antrian.poliId}`,
  JSON.stringify({
    type: "patient_called",
    data: {
      nomorAntrian: antrian.nomorAntrian,
      pasienId: antrian.pasienId,
      poliId: antrian.poliId,
    },
  })
)
```

```typescript
// server/socket/antrian.subscriber.ts — Redis subscriber → Socket.IO
import { Server as SocketIOServer } from "socket.io"
import { getRedisClient } from "../plugins/redis"

export function setupAntrianSubscriber(io: SocketIOServer) {
  const redis = createClient({ /* ... */ })
  const subscriber = redis.duplicate()

  // Subscribe ke semua channel antrian
  subscriber.pSubscribe("antrian:*", (message, channel) => {
    const poliId = channel.split(":")[1]
    const data = JSON.parse(message)

    // Broadcast ke semua client yang subscribe ke room poliId
    io.to(`antrian:${poliId}`).emit("antrian_update", data)
  })
}
```

**Kenapa pattern `antrian:{poliId}` per channel?** Setiap poli punya channel sendiri. Poli bedah tidak perlu menerima update antrian poli anak. Ini mengurangi noise dan bandwidth.

---

## 8. Elasticsearch — Search Engine

### 8.1 Index Mappings

#### 8.1.1 `ehealth_pasien` — Patient Search

```json
{
  "mappings": {
    "properties": {
      "noRM": { "type": "keyword" },
      "nik": { "type": "keyword" },
      "nama": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "alamat": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "jenis_kelamin": { "type": "keyword" },
      "tgl_lahir": { "type": "date" },
      "dokter": { "type": "keyword" },
      "poli": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

**Kenapa `nama` punya `completion` suggester?** Untuk fitur **search-as-you-type** di form pendaftaran. Petugas ketik 3 huruf pertama nama pasien → suggestion muncul.

#### 8.1.2 `ehealth_icd` — ICD-10 + ICD-9CM

```json
{
  "mappings": {
    "properties": {
      "code": { "type": "keyword" },
      "display_id": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "display_en": {
        "type": "text",
        "fields": { "suggest": { "type": "completion" } }
      },
      "searchText": {
        "type": "text",
        "analyzer": "standard"
      },
      "chapter": { "type": "keyword" },
      "category": { "type": "keyword" },
      "type": { "type": "keyword" }
    }
  }
}
```

**Kenapa searchText tetap text + analyzer?** Karena `completion` suggester hanya untuk prefix match. Untuk **full-text search** (user ketik "diabetes" → muncul "Diabetes mellitus type 2"), kita tetap butuh text search.

#### 8.1.3 `ehealth_audit_logs` — Audit Trail

```json
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "userId": { "type": "keyword" },
      "userRole": { "type": "keyword" },
      "method": { "type": "keyword" },
      "path": { "type": "keyword" },
      "status": { "type": "integer" },
      "duration": { "type": "integer" },
      "ip": { "type": "ip" },
      "userAgent": { "type": "text" }
    }
  }
}
```

**Kenapa audit log di Elasticsearch, bukan MongoDB?** Audit log akan tumbuh cepat (ribuan per hari). MongoDB tidak dioptimalkan untuk time-series data. Elasticsearch dengan date histogram aggregation bisa query "berapa request gagal dalam 24 jam terakhir" dalam <100ms.

### 8.2 Sync Strategy: MongoDB Change Stream → Elasticsearch

```typescript
// server/workers/sync-es.worker.ts
import mongoose from "mongoose"
import { Client } from "@elastic/elasticsearch"

const esClient = new Client({ node: "http://elasticsearch:9200" })

async function startESSyncWorker() {
  const db = mongoose.connection.db!

  // Watch MongoDB changes
  const changeStream = db.watch([
    { $match: { "ns.coll": { $in: ["pasiens", "icd10s", "icd9cms"] } } },
  ])

  for await (const change of changeStream) {
    switch (change.operationType) {
      case "insert":
      case "replace":
      case "update": {
        const doc = change.fullDocument
          || await db.collection(change.ns.coll).findOne({ _id: change.documentKey._id })
        await esClient.index({
          index: `ehealth_${change.ns.coll}`,
          id: doc._id.toString(),
          document: transformDocument(change.ns.coll, doc),
        })
        break
      }
      case "delete": {
        await esClient.delete({
          index: `ehealth_${change.ns.coll}`,
          id: change.documentKey._id.toString(),
        })
        break
      }
    }
  }
}

function transformDocument(coll: string, doc: any): any {
  if (coll === "pasiens") return transformPasien(doc)
  if (coll === "icd10s") return transformICD10(doc)
  return doc
}
```

**Kenapa Change Stream, bukan publish ke RabbitMQ?** Change Stream lebih reliable — setiap perubahan di MongoDB pasti tertangkap. Dengan RabbitMQ, ada kemungkinan publisher gagal publish tapi data sudah tersimpan. Untuk search sync, kita tidak butuh guaranteed delivery (search tidak critical), jadi Change Stream lebih sederhana.

### 8.3 Search API — Ganti MongoDB text search

```typescript
// server/api/icd/icd10.get.ts — search ICD-10 via Elasticsearch

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20

  if (!q || q.length < 2) {
    return sendSuccess(event, { items: [], total: 0 })
  }

  const body = await esClient.search({
    index: "ehealth_icd",
    from: (page - 1) * pageSize,
    size: pageSize,
    query: {
      bool: {
        should: [
          // Exact code match (boost tinggi)
          { term: { code: { value: q, boost: 10 } } },
          // Prefix match untuk search-as-you-type
          { prefix: { code: { value: q, boost: 5 } } },
          // Full-text match display_id
          { match: { display_id: { query: q, boost: 3, fuzziness: "AUTO" } } },
          // Full-text match searchText
          { match: { searchText: { query: q, boost: 2, fuzziness: "AUTO" } } },
          // Fuzzy match untuk typo
          { fuzzy: { display_id: { value: q, fuzziness: 1 } } },
        ],
      },
    },
    highlight: {
      fields: {
        display_id: { number_of_fragments: 0 },
      },
    },
  })

  return sendSuccess(event, {
    items: body.hits.hits.map((h) => ({
      code: h._source?.code,
      display_id: h._source?.display_id,
      display_en: h._source?.display_en,
      score: h._score,
      highlight: h.highlight?.display_id?.[0],
    })),
    total: typeof body.hits.total === "object"
      ? body.hits.total.value
      : body.hits.total,
  })
})
```

**Kenapa `fuzziness: "AUTO"` di Elasticsearch?** Ini yang tidak mungkin dilakukan MongoDB text index. Auto fuzziness artinya:
- Kata <3 karakter → exact only
- 3-5 karakter → 1 typo diizinkan (e.g. "hipertensi" matches "hipertensi")
- >5 karakter → 2 typo diizinkan (e.g. "hipertensii" matches "hipertensi")

---

## 9. Notifikasi Real-time

### 9.1 Arsitektur Notifikasi

```
┌───────────────────────────────────────────────────────────────────────┐
│                        Notifikasi Flow                                 │
│                                                                       │
│  ┌────────────────┐                                                   │
│  │ Trigger Events │                                                   │
│  │                │                                                   │
│  │ • Antrian      │                                                   │
│  │   dipanggil    │────┐                                              │
│  │ • Resep ready  │    │                                              │
│  │ • Lab result   │    │    ┌──────────────┐    ┌────────────────┐   │
│  │   completed    │────┼───►│ Redis Pub/Sub│───►│ Socket.IO      │   │
│  │ • Appointment  │    │    │              │    │ Server          │   │
│  │   reminder     │    │    │ Channel:     │    │                │   │
│  │ • Sync failed  │    │    │ notif:user:* │    │ Room per user: │   │
│  │   (admin)      │    │    └──────────────┘    │ user:{userId}  │   │
│  └────────────────┘    │                        └───────┬────────┘   │
│                         │                                │            │
│  ┌────────────────┐    │                        ┌───────▼────────┐   │
│  │ MongoDB        │    │                        │ Vue Client     │   │
│  │ notifikasi     │◄───┼────────────────────────│ • Bell icon    │   │
│  │ collection     │    │    (persist)           │ • Badge count  │   │
│  │                │    │                        │ • Dropdown     │   │
│  └────────────────┘    │                        │ • Click→read   │   │
│                         │                        └────────────────┘   │
│  ┌────────────────┐    │                                              │
│  │ Channel        │    │                                              │
│  │ Workers        │    │                                              │
│  │ (Email/WA/SMS) │◄───┘    (via RabbitMQ untuk yang async)           │
│  └────────────────┘                                                   │
└───────────────────────────────────────────────────────────────────────┘
```

### 9.2 Kenapa Redis Pub/Sub + Socket.IO, bukan polling?

**Polling (sekarang):**
```
Client ──GET /api/antrian/display──► Server ──query MongoDB──► Response
        ────────────── 5 detik ─────────────────────────────────────────►
Client ──GET /api/antrian/display──► Server ──query MongoDB──► Response
        ────────────── 5 detik ─────────────────────────────────────────►
...
```

- 100 client × 1 request/5 detik = 20 req/detik → 1.7 juta req/hari
- 90% request return data yang sama (tidak ada perubahan)
- Latency: sampai 5 detik

**Redis Pub/Sub + Socket.IO:**
```
Dokter klik "Panggil"
  → Server update MongoDB
  → Server publish "antrian:POLI-001" ke Redis
  → Redis broadcast ke semua subscriber
  → Socket.IO push ke semua client di room "antrian:POLI-001"
  → Client terima update <100ms
```

- 0 request ke server saat idle
- Latency: <100ms
- Bandwidth: hampir 0 saat tidak ada aktivitas

### 9.3 Model Notifikasi (MongoDB)

```typescript
// server/models/Notifikasi.ts
interface Notifikasi {
  userId: mongoose.Types.ObjectId
  type: "antrian_called" | "resep_ready" | "lab_completed"
    | "appointment_reminder" | "sync_failed" | "bpjs_claim" | "system"
  title: string
  message: string
  isRead: boolean
  relatedId?: string      // ID resource terkait (antrianId, resepId, dll)
  relatedType?: string     // "antrian", "resep", "lab"
  createdAt: Date
  readAt?: Date
}

// Index untuk query cepat
notifikasiSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
```

### 9.4 Socket.IO Setup di Nuxt

```typescript
// server/socket/index.ts
import { Server as SocketIOServer } from "socket.io"
import { getServerSession } from "#auth"
import { getRedisClient } from "../plugins/redis"

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialized")
  return io
}

export function initSocketIO(httpServer: any) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.AUTH_ORIGIN },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const session = await getServerSession(socket.request)
      if (!session?.user) return next(new Error("Unauthorized"))
      socket.data.userId = session.user.id
      socket.data.role = session.user.role
      next()
    } catch {
      next(new Error("Auth failed"))
    }
  })

  io.on("connection", (socket) => {
    // Join personal notification room
    socket.join(`user:${socket.data.userId}`)

    // Join role-based rooms
    socket.join(`role:${socket.data.role}`)

    // Subscribe ke Redis channel untuk user ini
    setupRedisSubscriber(socket)
  })

  return io
}

async function setupRedisSubscriber(socket: any) {
  const redis = await getRedisClient()
  const subscriber = redis.duplicate()

  // Subscribe ke channel notifikasi user
  await subscriber.subscribe(`notif:user:${socket.data.userId}`, (message) => {
    const data = JSON.parse(message)
    socket.emit("notification", data)
  })

  socket.on("disconnect", () => {
    subscriber.unsubscribe()
    subscriber.quit()
  })
}
```

### 9.5 In-App Notification UI (Vue Component)

```vue
<!-- components/NotificationBell.vue -->
<template>
  <UPopover :open="isOpen" @update:open="handleOpen">
    <UButton color="gray" variant="ghost" :ui="{ base: 'relative' }">
      <UIcon name="i-heroicons-bell" class="w-6 h-6" />
      <UBadge
        v-if="unreadCount > 0"
        color="red"
        size="xs"
        class="absolute -top-1 -right-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </UBadge>
    </UButton>

    <template #panel>
      <div class="w-80 max-h-96 overflow-y-auto">
        <div class="p-3 border-b flex justify-between">
          <span class="font-semibold">Notifikasi</span>
          <UButton size="xs" color="gray" variant="ghost" @click="markAllRead">
            Tandai semua dibaca
          </UButton>
        </div>
        <div v-if="notifications.length === 0" class="p-6 text-center text-gray-500">
          Tidak ada notifikasi
        </div>
        <div
          v-for="notif in notifications"
          :key="notif._id"
          class="p-3 border-b cursor-pointer hover:bg-gray-50"
          :class="{ 'bg-blue-50': !notif.isRead }"
          @click="handleClick(notif)"
        >
          <div class="text-sm font-medium">{{ notif.title }}</div>
          <div class="text-xs text-gray-500">{{ notif.message }}</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatTimeAgo(notif.createdAt) }}
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
const { data: notifications, refresh } = useFetch("/api/notifikasi")
const unreadCount = computed(() =>
  notifications.value?.filter((n) => !n.isRead).length ?? 0
)

// Socket.IO listener
const socket = useSocket()
socket.on("notification", (data) => {
  refresh() // refresh daftar notifikasi
  // Play sound
})
</script>
```

---

## 10. Email Blast — Optimasi Penuh

### 10.1 Masalah Sistem Sekarang

```
File: server/api/admin/email-blast.post.ts

Masalah:
1. runBlast() adalah fire-and-forget async function dalam 1 request HTTP
   → Jika request timeout atau server restart → PROGRESS HILANG
2. Batch size hardcoded 3 → terlalu kecil untuk list besar
3. Progress disimpan setiap 10 batch → jika crash di batch ke-9, 9 batch hilang
4. Rate limit detection hanya exponential sleep → tidak ada Redis counter
5. Tidak ada pause/resume → harus cancel & restart dari awal
6. Failed list di array dalam MongoDB document → bisa exceed 16MB limit
```

### 10.2 Arsitektur Email Blast Baru

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Email Blast Flow (Baru)                           │
│                                                                        │
│  Admin upload Excel (5000 kandidat)                                    │
│       │                                                                │
│       ▼                                                                │
│  ┌──────────────────┐                                                  │
│  │ API: POST        │  1. Validasi kolom mapping                       │
│  │ /api/admin/      │  2. Simpan ke MongoDB: EmailCampaign             │
│  │ email-blast      │     (status: "pending")                         │
│  └────────┬─────────┘  3. Publish job ke RabbitMQ                      │
│           │                                                             │
│  ┌────────▼─────────┐                                                  │
│  │ RabbitMQ         │  Exchange: ehealth.notification                  │
│  │ Queue:           │  Routing: email.blast.start                     │
│  │ email.blast      │                                                  │
│  └────────┬─────────┘                                                  │
│           │                                                             │
│  ┌────────▼──────────────────────────────────────────────────────┐    │
│  │ email.worker.ts  (consumer)                                    │    │
│  │                                                                 │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │ LOOP: while (campaign.nextIndex < campaign.total) {       │ │    │
│  │  │                                                           │ │    │
│  │  │   1. Cek Redis rate limiter                               │ │    │
│  │  │      INCR email:blast:counter                             │ │    │
│  │  │      if > MAX_BATCH → sleep (backoff)                     │ │    │
│  │  │                                                           │ │    │
│  │  │   2. Fetch recipients dari MongoDB                        │ │    │
│  │  │      (20 per batch, berdasarkan nextIndex)                │ │    │
│  │  │                                                           │ │    │
│  │  │   3. Render email (template + placeholder)                │ │    │
│  │  │      Template di-cache di Redis                           │ │    │
│  │  │                                                           │ │    │
│  │  │   4. Kirim via Nodemailer (promise.all 5 concurrent)      │ │    │
│  │  │      Success → update Redis progress counter              │ │    │
│  │  │      Fail → push ke Redis failed list                     │ │    │
│  │  │      Rate limit (421/450) → sleep 30s                     │ │    │
│  │  │                                                           │ │    │
│  │  │   5. Persist progress ke MongoDB (setiap 50 batch)        │ │    │
│  │  │      - sent, failed, nextIndex                            │ │    │
│  │  │      - Jika campaign.cancelled → break                    │ │    │
│  │  │                                                           │ │    │
│  │  │   6. Delay antar batch (200ms)                            │ │    │
│  │  │      → mencegah SMTP throttle                             │ │    │
│  │  │  }                                                        │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  │                                                                 │    │
│  │  Done → status: "done" → publish "email.blast.done" ke Redis   │    │
│  │  Error → status: "failed" → publish "email.blast.failed"        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Kenapa Perubahan Ini?

| Dulu | Sekarang | Kenapa |
|------|----------|--------|
| Fire-and-forget async dalam 1 request | RabbitMQ message → dedicated worker | Worker tidak terikat request lifecycle, bisa jalan berjam-jam |
| Batch 3, tidak adjustable | Batch 20, configurable via env | 3 terlalu lambat untuk >1000 penerima |
| Progress persist setiap 10 batch | Progress di Redis real-time, persist MongoDB setiap 50 batch | Crash di antara batch → max kehilangan 50 batch (bukan seluruh campaign) |
| Gmail rate limit: backoff naif | Redis rate counter + window | Lebih akurat, tidak over-throttle |
| Cancel harus check di setiap batch | Update MongoDB `status: "cancelled"` → worker cek setiap iterasi | Cancel responsif (dalam 1-2 batch, ~1 menit) |
| Failed list di array MongoDB | Failed list di Redis (temporary) + persist ke file CSV setelah done | Tidak ada limit 16MB |
| Tidak ada pause/resume | Pause: set status "paused" → worker break. Resume: publish ulang | Admin bisa pause untuk maintenance |

### 10.4 Implementasi `email.worker.ts`

```typescript
// server/workers/email.worker.ts
import amqp from "amqplib"
import { getRedisClient } from "../plugins/redis"
import { getNodemailer } from "../utils/mailer"

const MAX_CONCURRENT = 5       // Kirim 5 email bersamaan
const BATCH_SIZE = 20           // 20 penerima per batch
const PERSIST_INTERVAL = 50     // Persist MongoDB setiap 50 batch
const BATCH_DELAY = 200         // 200ms delay antar batch
const RATE_LIMIT_WINDOW = 60    // 60 detik window
const RATE_LIMIT_MAX = 100      // Max 100 email per 60 detik (Gmail SMTP limit)

async function startEmailWorker() {
  const conn = await amqp.connect(/* ... */)
  const channel = await conn.createChannel()

  await channel.assertQueue("email.blast", { durable: true })
  await channel.bindQueue("email.blast", "ehealth.notification", "")

  channel.prefetch(1) // 1 campaign per worker

  await channel.consume("email.blast", async (msg) => {
    if (!msg) return

    const { campaignId } = JSON.parse(msg.content.toString())
    await processEmailCampaign(campaignId)
    channel.ack(msg)
  })
}

async function processEmailCampaign(campaignId: string) {
  const redis = await getRedisClient()
  const mailer = await getNodemailer()

  // Progress keys di Redis
  const progressKey = `email:campaign:${campaignId}:sent`
  const failedKey = `email:campaign:${campaignId}:failed`
  const rateKey = `email:rate:${campaignId}`

  // Load campaign
  let campaign = await EmailCampaign.findById(campaignId)
  if (!campaign || campaign.status !== "running") return

  let batchCount = 0
  let consecutiveRateLimited = 0

  while (campaign.nextIndex < campaign.total) {
    // === Cek jika di-cancel ===
    campaign = await EmailCampaign.findById(campaignId)
    if (campaign?.status === "cancelled" || campaign?.status === "paused") {
      await redis.del(progressKey, failedKey, rateKey)
      return
    }

    // === Rate Limit Check (Redis) ===
    const currentRate = await redis.incr(rateKey)
    if (currentRate === 1) {
      await redis.expire(rateKey, RATE_LIMIT_WINDOW)
    }
    if (currentRate > RATE_LIMIT_MAX) {
      consecutiveRateLimited++
      const backoff = Math.min(consecutiveRateLimited * 30_000, 300_000) // max 5 menit
      console.log(`[Email Blast] Rate limited, backoff ${backoff / 1000}s`)
      await sleep(backoff)
      continue
    }
    consecutiveRateLimited = 0

    // === Fetch batch dari MongoDB ===
    const recipients = await fetchRecipients(campaign.nextIndex, BATCH_SIZE)

    // === Render & Kirim (concurrent) ===
    const results = await Promise.allSettled(
      recipients.map(async (recipient, i) => {
        const html = renderTemplate(campaign.templateBody, recipient)
        try {
          await mailer.sendMail({
            from: campaign.from,
            to: recipient.email,
            subject: renderTemplate(campaign.templateSubject, recipient),
            html,
          })
          await redis.incr(progressKey)
        } catch (error: any) {
          await redis.rPush(failedKey, JSON.stringify({
            email: recipient.email,
            error: error.message,
            timestamp: new Date().toISOString(),
          }))
        }
      })
    )

    // === Update campaign pointer ===
    campaign.nextIndex += recipients.length
    batchCount++

    // === Persist progress ke MongoDB ===
    if (batchCount % PERSIST_INTERVAL === 0) {
      const sent = parseInt(await redis.get(progressKey) || "0")
      const failedCount = await redis.lLen(failedKey)
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        $set: {
          nextIndex: campaign.nextIndex,
          sent: sent,
          failed: failedCount,
        },
      })
    }

    // === Delay antar batch ===
    await sleep(BATCH_DELAY)
  }

  // === Selesai ===
  const sent = parseInt(await redis.get(progressKey) || "0")
  const failedList = await redis.lRange(failedKey, 0, -1)

  await EmailCampaign.findByIdAndUpdate(campaignId, {
    status: "done",
    sent,
    failed: failedList.length,
    failedList: failedList.map(JSON.parse).slice(0, 1000), // max 1000 di MongoDB
    completedAt: new Date(),
  })

  // Simpan full failed list ke file CSV
  if (failedList.length > 0) {
    const csv = "email,error,timestamp\n" + failedList.map((f) => {
      const d = JSON.parse(f)
      return `${d.email},${d.error},${d.timestamp}`
    }).join("\n")
    // Simpan ke storage atau kirim via email ke admin
  }

  // Cleanup Redis
  await redis.del(progressKey, failedKey, rateKey)

  // Notifikasi admin
  const adminRedis = await getRedisClient()
  await adminRedis.publish("email:blast:done", JSON.stringify({
    campaignId,
    sent,
    failed: failedList.length,
  }))
}
```

### 10.5 Pause / Resume / Cancel

```typescript
// server/api/admin/email-blast/pause.post.ts
export default defineEventHandler(async (event) => {
  const { campaignId } = await readBody(event)

  // Set status "paused" — worker akan membaca ini di iterasi berikutnya
  await EmailCampaign.findByIdAndUpdate(campaignId, { status: "paused" })

  return sendSuccess(event, { message: "Campaign paused" })
})

// server/api/admin/email-blast/resume.post.ts
export default defineEventHandler(async (event) => {
  const { campaignId } = await readBody(event)

  // Resume: set status running & publish ulang ke queue
  const campaign = await EmailCampaign.findByIdAndUpdate(campaignId, {
    status: "running",
  }, { new: true })

  const channel = await getRabbitMQChannel()
  channel.publish("ehealth.notification", "", Buffer.from(JSON.stringify({
    campaignId,
  })))

  return sendSuccess(event, {
    message: `Resumed. Progress: ${campaign?.sent}/${campaign?.total}`,
  })
})
```

### 10.6 Rate Limiter Yang Akurat

Di sistem sekarang, rate limiting hanya exponential backoff — tidak ada counter akurat. Dengan Redis:

```typescript
// Rate limiter Redis yang akurat
async function checkEmailRateLimit(campaignId: string): Promise<boolean> {
  const redis = await getRedisClient()
  const key = `email:rate:${campaignId}`

  // INCR adalah atomic → tidak ada race condition
  const count = await redis.incr(key)

  // Set TTL saat pertama kali
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW)
  }

  return count <= RATE_LIMIT_MAX
}
```

**Kenapa `INCR` + `EXPIRE` bukan `MULTI`/`EXEC`?** Karena `INCR` dan `EXPIRE` adalah dua command terpisah. Tapi untuk use case ini, race condition-nya tidak critical — worst case: TTL diset 2 kali (masih 60 detik).

---

## 11. Security Hardening VPS

### 11.1 UFW Firewall

```bash
#!/bin/bash
# setup-firewall.sh — jalankan SEBELUM docker-compose up

# Default policy: block all incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH
sudo ufw allow 22/tcp

# HTTP/HTTPS (Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Docker services hanya bisa diakses dari localhost
# Tidak perlu buka port karena bind ke 127.0.0.1

sudo ufw enable
sudo ufw status verbose
```

**Kenapa `127.0.0.1` di docker-compose ports?** Docker by default bypass UFW. Jika kita tulis `"6379:6379"` tanpa `127.0.0.1`, port 6379 bisa diakses dari internet meskipun UFW memblokirnya. Dengan `"127.0.0.1:6379:6379"`, port hanya bisa diakses dari dalam VPS.

### 11.2 Fail2ban

```ini
# /etc/fail2ban/jail.local

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
```

### 11.3 Docker Container Security

```dockerfile
# Dockerfile — Nuxt App
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Hanya copy yang diperlukan
COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/
COPY --from=build /app/node_modules /app/node_modules

USER appuser
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

**Kenapa non-root user?** Jika ada vulnerability di aplikasi yang bisa RCE, attacker hanya dapat akses sebagai `appuser`, bukan root. Ini membatasi damage.

### 11.4 Environment Variables

```bash
# .env — PERNAH DI-COMMIT KE GIT (tambahkan ke .gitignore!)
# .gitignore harus berisi:
#   .env
#   .env.local
#   certbot/

# === MongoDB ===
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ehealth?retryWrites=true

# === Redis ===
REDIS_HOST=ehealth-redis
REDIS_PORT=6379
REDIS_PASSWORD=strong-redis-password-here

# === RabbitMQ ===
RABBITMQ_HOST=ehealth-rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=ehealth
RABBITMQ_PASS=strong-rabbitmq-password-here

# === Elasticsearch ===
ELASTICSEARCH_HOST=http://elasticsearch:9200

# === Auth ===
AUTH_SECRET=very-long-random-secret-string-here
AUTH_ORIGIN=https://ehealth.rs-sehat.id

# === SMTP ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@rs-sehat.id
SMTP_PASS=app-specific-password

# === SatuSehat ===
SATUSEHAT_BASE_URL=https://api-satusehat-dev.dto.kemkes.go.id
SATUSEHAT_CLIENT_ID=your-client-id
SATUSEHAT_CLIENT_SECRET=your-client-secret
SATUSEHAT_ORG_ID=your-org-id

# === BPJS ===
BPJS_PCARE_URL=https://pcare.bpjs-kesehatan.go.id
BPJS_VCLAIM_URL=https://vclaim.bpjs-kesehatan.go.id
BPJS_CONS_ID=your-cons-id
BPJS_SECRET_KEY=your-secret-key
BPJS_USER_KEY=your-user-key
BPJS_PPK_CODE=your-ppk-code

# === SINOAP ===
SINOAP_BASE_URL=https://sinoap.kemkes.go.id
SINOAP_API_KEY=your-api-key
SINOAP_FACILITY_ID=your-facility-id

# === Email Blast ===
EMAIL_BLAST_MAX_CONCURRENT=5
EMAIL_BLAST_BATCH_SIZE=20
EMAIL_BLAST_RATE_LIMIT=100
EMAIL_BLAST_RATE_WINDOW=60
```

### 11.5 Let's Encrypt SSL via Certbot

```bash
#!/bin/bash
# setup-ssl.sh — jalankan setelah docker-compose up

DOMAIN="ehealth.rs-sehat.id"

# Request certificate (standalone mode)
sudo certbot certonly \
  --webroot \
  -w /path/to/certbot/www \
  -d $DOMAIN \
  --non-interactive \
  --agree-tos \
  --email admin@rs-sehat.id

# Auto renew cron
echo "0 3 * * * certbot renew --quiet && docker restart ehealth-nginx" | sudo crontab -
```

---

## 12. Estimasi Resource

### 12.1 Spesifikasi VPS

| Spesifikasi | Minimal | Rekomendasi |
|-------------|---------|-------------|
| vCPU | 2 core | 4 core |
| RAM | 4 GB | 8 GB |
| SSD | 40 GB | 80 GB |
| Bandwidth | 2 TB | 4 TB |
| Provider | Hetzner ~$5 | Hetzner ~$12 |

### 12.2 Alokasi Memory per Container

| Container | Memory (Min) | Memory (Rekomendasi) |
|-----------|-------------|---------------------|
| Nuxt App | 512 MB | 1 GB |
| Redis | 256 MB | 512 MB |
| RabbitMQ | 256 MB | 512 MB |
| Elasticsearch | 512 MB | 1 GB |
| Worker | 256 MB | 512 MB |
| Nginx | 64 MB | 128 MB |
| OS Overhead | 512 MB | 1 GB |
| **Total** | **~2.3 GB** | **~4.6 GB** |

### 12.3 Kenapa Min 4GB RAM?

Elasticsearch butuh minimal 512 MB heap. Redis + RabbitMQ sekitar 500 MB. Node.js app sekitar 512 MB. OS 500 MB. Total ~2 GB. Tapi Docker container overhead dan buffer → 4 GB lebih aman untuk production.

---

## 13. Checklist Migrasi

### Phase 1 — Redis (3-5 Hari)

```
[ ] Setup Redis Docker container
[ ] Tambahkan REDIS_* env variables
[ ] Buat server/plugins/redis.ts (Nitro plugin)
[ ] Migrasi FHIR token cache dari in-memory ke Redis
[ ] Implementasi rate limiting middleware dengan Redis
[ ] Implementasi dashboard cache (TTL 5 menit)
[ ] Setup Redis session untuk session revocation
[ ] Test: cache hit/miss, rate limit behavior
```

### Phase 2 — RabbitMQ (5-7 Hari)

```
[ ] Setup RabbitMQ Docker container
[ ] Tambahkan RABBITMQ_* env variables
[ ] Buat server/rabbitmq/connection.ts
[ ] Buat server/rabbitmq/publishers/* (satusehat, bpjs, email, sinoap)
[ ] Refaktor server/jobs/queue.ts → hapus, ganti dengan RabbitMQ publishers
[ ] Buat server/workers/* (satusehat, bpjs, email, sinoap)
[ ] Setup PM2/Docker untuk worker processes
[ ] Setup Dead Letter Queues
[ ] Setup RabbitMQ Management UI
[ ] Hapus server/tasks/* (Nitro cron tasks)
[ ] Test: publish → consume → retry → DLQ flow
```

### Phase 3 — Elasticsearch (5-7 Hari)

```
[ ] Setup Elasticsearch + Kibana Docker container
[ ] Buat index mappings (pasien, icd, rekamedis, audit_logs)
[ ] Buat server/workers/sync-es.worker.ts (Change Stream)
[ ] Initial bulk index (seed data dari MongoDB)
[ ] Refaktor server/api/icd/* → pakai Elasticsearch
[ ] Buat search endpoint pasien & rekamedis
[ ] Setup Kibana dashboard untuk monitoring
```

### Phase 4 — Notifikasi Real-time (3-5 Hari)

```
[ ] Setup Socket.IO di Nuxt server
[ ] Setup Redis Pub/Sub subscriber
[ ] Buat model Notifikasi (MongoDB)
[ ] Buat API notifikasi CRUD
[ ] Publish event dari API handlers (antrian panggil, resep ready, dll)
[ ] Buat komponen NotificationBell.vue
[ ] Test: real-time push dari server ke client
```

### Phase 5 — VPS Deployment (2-3 Hari)

```
[ ] Provision VPS (Hetzner/DigitalOcean)
[ ] Install Docker + Docker Compose
[ ] Setup UFW firewall
[ ] Setup fail2ban
[ ] Clone repository → build Docker images
[ ] Setup .env production
[ ] Setup Nginx + SSL via Certbot
[ ] Setup domain DNS → VPS IP
[ ] Test semua endpoint production
[ ] Setup monitoring (Uptime Kuma, PM2)
[ ] Setup auto-backup (MongoDB dump ke S3, volume backup)
```

---

## Lampiran A: Perbandingan Teknologi

| Kebutuhan | Sekarang | Target | Alasan |
|-----------|----------|--------|--------|
| Job Queue | MongoDB collection | RabbitMQ | Ack, DLQ, retry, monitoring |
| Scheduler | Nitro cron | RabbitMQ x-delayed-message | Fault-tolerant, dari 30s polling ke event-driven |
| Cache | In-memory variable | Redis | Shared cache, TTL, atomic ops |
| Session | JWT-only | Redis-backed session | Session revocation |
| Rate Limiting | Tidak ada | Redis counter | Akurat, atomic |
| Search | MongoDB text index | Elasticsearch | Fuzzy, typo tolerance, autocomplete |
| Real-time | Polling (5s) | Redis Pub/Sub + Socket.IO | <100ms latency, 0 idle request |
| Email Blast | Fire-and-forget async | RabbitMQ job + Redis progress | Restart-safe, pause/resume, proper rate limit |
| Logging | Console | Elasticsearch + Kibana | Searchable, aggregatable, alert |
| Monitoring | Tidak ada | PM2 + RabbitMQ UI + Kibana + Uptime Kuma | Visibility |
| Deploy | Vercel (serverless) | VPS + Docker Compose | Long-running workers, WebSocket, broker support |

---

*Dokumen ini dibuat sebagai panduan arsitektur untuk migrasi e-Health SIMPRS ke infrastruktur modern berbasis VPS.*
