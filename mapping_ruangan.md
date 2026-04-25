# 📐 Interactive Floor Plan (PNG + SVG Overlay) — Nuxt 3 + Vue 3

## 🎯 Objective

Membuat denah lantai (berdasarkan file PDF arsitektur) menjadi **interactive map** di web:

* Bisa klik per ruangan
* Presisi mengikuti layout asli
* Support multi lantai

Referensi: denah pada file PDF (contoh halaman semi-basement & lantai lainnya)

---

# 🧭 Workflow Utama

```plaintext
PDF → PNG (high-res) → SVG tracing → Extract path → JSON → Vue component → Interactive UI
```

---

# 🧩 TASK LIST (END-TO-END)

## 1. Prepare Asset (PNG Base)

* Convert PDF ke PNG resolusi tinggi (**≥300 DPI**)
* Pisahkan per lantai:

  ```
  /public/denah/lantai-1.png
  /public/denah/lantai-2.png
  ```

* Pastikan ukuran tidak berubah setelah export

---

## 2. Tracing Ruangan (SVG Authoring)

Tools: **Figma / Adobe Illustrator**

### Langkah

* Import PNG
* Lock layer background
* Gunakan **Pen Tool (P)** untuk trace tiap ruangan
* Ikuti dinding (bukan furniture)
* Tutup polygon dengan rapi

### Naming layer (WAJIB)

```
room-icu-01
room-lobby
room-lift-a
room-admin-02
```

### Struktur

```
Frame: lantai-1
  ├── room-icu-01
  ├── room-icu-02
  ├── room-lobby
```

---

## 3. Export SVG

* Export frame sebagai SVG
* Gunakan setting:

  * Outline stroke
  * Preserve vector

---

## 4. Cleanup SVG

Edit file SVG:

```html
<path id="room-icu-01" d="M10,10 L100,10 L100,100 Z" />
```

* Hapus atribut tidak perlu
* Pastikan setiap ruangan punya `id`

---

## 5. Convert SVG → JSON Data

Buat struktur data:

```json
[
  {
    "id": "room-icu-01",
    "name": "ICU 01",
    "path": "M10,10 L100,10 L100,100 Z",
    "floor": 1
  }
]
```

Simpan:

```
/data/rooms/lantai-1.json
```

---

## 6. Implement di Nuxt 3 (Vue 3)

### Component: FloorPlan.vue

```vue
<template>
  <div class="relative w-full">
    <!-- Background Image -->
    <img :src="image" class="w-full" />

    <!-- SVG Overlay -->
    <svg
      class="absolute top-0 left-0 w-full h-full"
      :viewBox="viewBox"
      preserveAspectRatio="none"
    >
      <path
        v-for="room in rooms"
        :key="room.id"
        :d="room.path"
        class="room"
        @click="selectRoom(room)"
      />
    </svg>
  </div>
</template>

<script setup>
import rooms from '@/data/rooms/lantai-1.json'

const image = '/denah/lantai-1.png'
const viewBox = '0 0 1000 800'

const selectedRoom = ref(null)

const selectRoom = (room) => {
  selectedRoom.value = room
  console.log(room)
}
</script>

<style>
.room {
  fill: transparent;
  cursor: pointer;
  transition: 0.2s;
}
.room:hover {
  fill: rgba(59, 130, 246, 0.3);
}
</style>
```

---

## 7. Sinkronisasi SVG & PNG (KRUSIAL)

Pastikan:

* Ukuran PNG = ukuran SVG viewBox

Contoh:

```
PNG: 1000 x 800
SVG: viewBox="0 0 1000 800"
```

---

## 8. Interaksi UI

Tambahkan fitur:

* Hover highlight
* Tooltip nama ruangan
* Klik → tampil detail

Contoh:

```js
const selectRoom = (room) => {
  selectedRoom.value = room
}
```

---

## 9. Multi Lantai Support

### State lantai

```vue
<select v-model="floor">
  <option value="1">Lantai 1</option>
  <option value="2">Lantai 2</option>
</select>
```

### Load data dinamis

```js
const rooms = computed(() => {
  return floor.value === 1 ? lantai1 : lantai2
})
```

---

# ⚠️ Common Issues

### ❌ Polygon tidak presisi

* PNG berubah ukuran
* Tracing tidak akurat

### ❌ Klik meleset

* SVG tidak full overlay
* viewBox salah

### ❌ Performance berat

* Terlalu banyak path → gunakan grouping

---

# 🚀 Enhancement (Opsional)

* Zoom & pan (seperti Google Maps)
* Filter kategori ruangan
* Search ruangan
* Animasi highlight
* Integrasi database ruangan

---

# 🧠 Insight Penting

* 80% effort ada di **tracing SVG**
* Coding relatif sederhana
* Presisi bergantung pada asset, bukan logic

---

# ✅ Deliverables

* PNG per lantai
* SVG clean per lantai
* JSON mapping ruangan
* Vue component interactive

---

# 📌 Summary

Gunakan pendekatan:

> **PNG sebagai visual base + SVG sebagai layer interaktif**

Ini adalah solusi:

* Paling stabil
* Paling scalable
* Paling sesuai dengan denah kompleks seperti file kamu

---
