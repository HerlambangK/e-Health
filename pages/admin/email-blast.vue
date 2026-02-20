<template>
  <div class="pb-10 flex-grow space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Email Blast Kandidat</h2>
        <p class="text-sm text-gray-500">
          Upload file Excel, mapping kolom, lalu kirim email ke kandidat sekaligus.
        </p>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <UBadge v-if="selectedFileName" label="File" variant="subtle" />
        <span
          v-if="selectedFileName"
          class="max-w-[220px] truncate text-xs text-gray-500 sm:max-w-xs"
        >
          {{ selectedFileName }}
        </span>
        <UBadge v-if="selectedSheet" :label="`Sheet: ${selectedSheet}`" variant="subtle" />
        <UBadge color="gray" variant="soft" :label="`Total: ${rows.length}`" />
        <UBadge color="primary" variant="soft" :label="`Valid: ${validRecipients.length}`" />
        <UBadge
          color="red"
          variant="soft"
          :label="`Invalid: ${rows.length - validRecipients.length}`"
        />
        <UBadge v-if="isSending" label="Sending" variant="subtle" />
      </div>
    </div>

    <UAccordion multiple :items="accordionItems" :ui="{ wrapper: 'space-y-4' }">
      <template #upload>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900">Upload Excel</div>
              <p class="text-xs text-gray-500">
                Pilih file .xlsx/.xls, lalu tentukan sheet dan baris header.
              </p>
            </div>
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              :disabled="!selectedSheet"
              class="w-full sm:w-auto"
              @click="loadDataFromExcel"
            >
              Dapatkan Data Excel
            </UButton>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-[1.1fr,1fr]">
            <div class="min-w-0 rounded-lg border border-dashed border-gray-200 p-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                class="block w-full text-sm text-gray-700"
                @change="handleFileChange"
              />
              <p class="mt-2 text-xs text-gray-500">
                Pastikan file berisi kolom email, nama kandidat, dan lowongan yang dilamar.
              </p>
              <p v-if="selectedFileName" class="mt-2 text-xs text-gray-500">
                File terpilih: <span class="font-medium text-gray-700">{{ selectedFileName }}</span>
              </p>
            </div>

            <div class="min-w-0 grid gap-3 sm:grid-cols-2">
              <UFormGroup label="Sheet">
                <USelectMenu
                  v-model="selectedSheet"
                  :options="sheetOptions"
                  value-attribute="value"
                />
              </UFormGroup>
              <UFormGroup label="Baris Header (1-based)">
                <UInput v-model.number="headerRowIndex" type="number" min="1" />
              </UFormGroup>
              <div class="sm:col-span-2 text-xs text-gray-500">
                Sheet terpilih: <span class="font-medium text-gray-700">{{ selectedSheet || "-" }}</span>
              </div>
            </div>
          </div>

          <UAlert v-if="parseError" color="red" variant="soft" icon="i-heroicons-exclamation-triangle" class="mt-3">
            {{ parseError }}
          </UAlert>
        </div>
      </template>

      <template #mapping>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900">Mapping Kolom</div>
              <p class="text-xs text-gray-500">
                Cocokkan kolom Excel dengan data yang akan digunakan pada email.
              </p>
            </div>
            <div class="text-xs text-gray-500">
              Wajib: <span class="font-medium text-gray-700">Email, Nama, Lowongan</span>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="entry in mappingEntries"
              :key="entry.id"
              class="flex flex-col gap-2 md:flex-row md:items-end"
            >
              <UFormGroup
                :label="`Kolom ${entry.label}`"
                :required="entry.required"
                class="flex-1"
              >
                <USelectMenu
                  v-model="entry.column"
                  :options="columnOptions"
                  placeholder="Pilih kolom"
                  value-attribute="value"
                  :class="entry.required && !entry.column ? 'ring-1 ring-red-500 rounded-md' : ''"
                />
              </UFormGroup>
              <UButton
                v-if="!entry.required"
                icon="i-heroicons-trash"
                size="xs"
                color="red"
                variant="soft"
                class="md:mb-1"
                @click="removeMapping(entry.id)"
              />
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <USelectMenu
                v-model="selectedOptional"
                :options="optionalMappingOptions"
                placeholder="Tambah mapping"
                value-attribute="value"
                class="w-full sm:w-56"
              />
              <UButton
                size="xs"
                color="primary"
                variant="soft"
                :disabled="!selectedOptional"
                @click="addMapping"
              >
                Tambah Mapping
              </UButton>
            </div>
          </div>

          <UAlert v-if="rows.length === 0" color="gray" variant="soft" icon="i-heroicons-information-circle" class="mt-3">
            Upload file terlebih dahulu untuk melihat opsi kolom.
          </UAlert>
        </div>
      </template>

      <template #edit>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900">Edit Data</div>
              <div class="text-xs text-gray-500">
                Edit nilai sebelum dikirim. Perubahan akan mempengaruhi preview dan email blast.
              </div>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <UInput
                v-model="editFilter"
                size="xs"
                placeholder="Cari nama/email/lowongan"
                icon="i-heroicons-magnifying-glass"
                class="w-full sm:w-56"
              />
              <USelectMenu
                v-model="editFilterMode"
                size="xs"
                :options="filterModeOptions"
                class="w-full sm:w-40"
              />
              <UButton
                size="xs"
                variant="soft"
                color="gray"
                class="w-full sm:w-auto"
                :icon="showPasswords ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showPasswords = !showPasswords"
              >
                {{ showPasswords ? "Sembunyikan Password" : "Lihat Password" }}
              </UButton>
              <UButton
                size="xs"
                variant="soft"
                color="red"
                :disabled="selectedRows.length === 0"
                class="w-full sm:w-auto"
                @click="bulkDelete"
              >
                Hapus Terpilih ({{ selectedRows.length }})
              </UButton>
            </div>
          </div>

          <div class="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
            <UTable
              v-model="selectedRows"
              class="min-w-[720px] w-full"
              :rows="filteredEditRows"
              :columns="editColumns"
              :empty-state="{ icon: 'i-heroicons-inbox', label: 'Tidak ada data' }"
            >
            <template #email-data="{ row }">
              <UInput
                :model-value="getCellValue(row._rowIndex, mappingKeys.email)"
                @update:model-value="(val) => setCellValue(row._rowIndex, mappingKeys.email, val)"
                size="xs"
                :disabled="!mappingKeys.email"
                :class="inputClass(getCellValue(row._rowIndex, mappingKeys.email), requiredFields.email, 'email')"
              />
            </template>
            <template #nama-data="{ row }">
              <UInput
                :model-value="getCellValue(row._rowIndex, mappingKeys.name)"
                @update:model-value="(val) => setCellValue(row._rowIndex, mappingKeys.name, val)"
                size="xs"
                :disabled="!mappingKeys.name"
                :class="inputClass(getCellValue(row._rowIndex, mappingKeys.name), requiredFields.name)"
              />
            </template>
            <template #lowongan-data="{ row }">
              <UInput
                :model-value="getCellValue(row._rowIndex, mappingKeys.position)"
                @update:model-value="(val) => setCellValue(row._rowIndex, mappingKeys.position, val)"
                size="xs"
                :disabled="!mappingKeys.position"
                :class="inputClass(getCellValue(row._rowIndex, mappingKeys.position), requiredFields.position)"
              />
            </template>
            <template v-if="showColumn('username')" #username-data="{ row }">
              <UInput
                :model-value="getCellValue(row._rowIndex, mappingKeys.username)"
                @update:model-value="(val) => setCellValue(row._rowIndex, mappingKeys.username, val)"
                size="xs"
                :disabled="!mappingKeys.username"
                :class="inputClass(getCellValue(row._rowIndex, mappingKeys.username), requiredFields.username)"
              />
            </template>
            <template v-if="showColumn('password')" #password-data="{ row }">
              <UInput
                :model-value="getCellValue(row._rowIndex, mappingKeys.password)"
                @update:model-value="(val) => setCellValue(row._rowIndex, mappingKeys.password, val)"
                size="xs"
                :type="showPasswords ? 'text' : 'password'"
                :disabled="!mappingKeys.password"
                :class="inputClass(getCellValue(row._rowIndex, mappingKeys.password), requiredFields.password)"
              />
            </template>
            <template #actions-data="{ row }">
              <UButton
                icon="i-heroicons-trash"
                size="xs"
                color="red"
                variant="soft"
                @click="removeRow(row._rowIndex)"
              />
            </template>
            </UTable>
          </div>
        </div>
      </template>

      <template #template>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm font-semibold text-gray-900">Template Email</div>
            <div class="flex flex-wrap gap-2">
              <UButton size="xs" variant="soft" color="gray" @click="createNewTemplate">
                Template Baru
              </UButton>
              <UButton size="xs" variant="soft" color="gray" :disabled="!selectedTemplateId" @click="deleteTemplate">
                Hapus Template
              </UButton>
              <UButton size="xs" color="primary" :disabled="!templateName || !templateBody" @click="saveTemplate">
                Simpan Template
              </UButton>
            </div>
          </div>

          <div class="mt-4 grid gap-6 lg:grid-cols-[1fr,1.2fr]">
            <div class="min-w-0 space-y-4">
              <UFormGroup label="Pilih Template">
                <USelectMenu
                  v-model="selectedTemplateId"
                  :options="templateOptions"
                  placeholder="Pilih template"
                  value-attribute="value"
                />
              </UFormGroup>
              <UFormGroup label="Nama Template">
                <UInput v-model="templateName" placeholder="Nama template" />
              </UFormGroup>
              <UFormGroup label="Subject">
                <UInput v-model="templateSubject" placeholder="Subject email" />
              </UFormGroup>
              <UFormGroup label="Test Email (optional)">
                <UInput v-model="testEmail" placeholder="contoh: ccoba8844@gmail.com" />
              </UFormGroup>

              <UAlert
                v-if="testEmail"
                color="amber"
                variant="soft"
                icon="i-heroicons-exclamation-triangle"
              >
                Mode test aktif. Semua email akan dikirim ke <strong>{{ testEmail }}</strong>.
                Kosongkan test email jika ingin mengirim ke email di tabel.
              </UAlert>

              <div class="rounded-lg border border-gray-100 bg-gray-50/40 p-3 text-xs text-gray-600">
                Placeholder tersedia:
                <div class="mt-2 flex flex-wrap gap-2">
                  <UBadge color="gray" variant="soft">[nama-kandidat]</UBadge>
                  <UBadge color="gray" variant="soft">[lowongan]</UBadge>
                  <UBadge color="gray" variant="soft">[username]</UBadge>
                  <UBadge color="gray" variant="soft">[password]</UBadge>
                  <UBadge color="gray" variant="soft">[email]</UBadge>
                </div>
              </div>
            </div>

            <div class="min-w-0">
              <UFormGroup label="Body">
                <UTextarea v-model="templateBody" rows="12" placeholder="Tulis body template" />
              </UFormGroup>
            </div>
          </div>
        </div>
      </template>

      <template #preview>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>Total baris: <strong>{{ rows.length }}</strong></span>
            <span>Valid: <strong>{{ validRecipients.length }}</strong></span>
            <span>Invalid/Skip: <strong>{{ rows.length - validRecipients.length }}</strong></span>
          </div>
          <p v-if="testEmail" class="mt-2 text-xs text-amber-600">
            Preview menampilkan target pengiriman yang sebenarnya (mode test aktif).
          </p>

          <div class="mt-4 grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <div class="min-w-0">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span class="text-xs text-gray-500">Baris per halaman</span>
                <USelect v-model="previewPageSize" :options="[5, 10, 20, 50]" size="xs" class="w-24" />
              </div>

              <div class="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
                <UTable
                  class="min-w-[680px] w-full"
                  :rows="pagedPreviewRows"
                  :columns="previewColumns"
                  :empty-state="{ icon: 'i-heroicons-inbox', label: 'Tidak ada data' }"
                >
                  <template v-if="showColumn('password')" #password-data="{ row }">
                    <span>{{ showPasswords ? row.password : "••••••" }}</span>
                  </template>
                </UTable>
              </div>

              <div class="mt-3">
                <UPagination
                  v-model="previewPage"
                  :page-count="previewPageSize"
                  :total="previewTotal"
                  :ui="{ wrapper: 'flex flex-wrap items-center gap-2 justify-center sm:justify-start' }"
                />
              </div>
            </div>

            <div class="min-w-0 space-y-4">
              <div class="rounded-lg border border-gray-100 p-4">
                <h4 class="text-sm font-semibold text-gray-900">Preview Email (baris pertama)</h4>
                <p class="text-xs text-gray-500">
                  Preview ini akan berubah saat kamu edit data atau template.
                </p>
                <div class="mt-3 space-y-2 text-sm">
                  <div>
                    <span class="font-semibold">Subject:</span>
                    <div class="mt-1 text-gray-700">{{ previewEmail.subject }}</div>
                  </div>
                  <div>
                    <span class="font-semibold">Body:</span>
                    <pre class="mt-1 whitespace-pre-wrap text-gray-700">{{ previewEmail.body }}</pre>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border border-gray-100 p-4">
                <div class="flex flex-col gap-2">
                  <UButton
                    color="primary"
                    size="lg"
                    :loading="isSending"
                    :disabled="!canSend"
                    class="w-full"
                    @click="sendBlast"
                  >
                    Kirim Email Blast
                  </UButton>
                  <p v-if="!canSend" class="text-xs text-gray-500">
                    Pastikan data valid dan template sudah lengkap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const accordionItems = [
  { label: "1. Upload Excel", slot: "upload" },
  { label: "2. Mapping Kolom", slot: "mapping" },
  { label: "3. Edit Data (Opsional)", slot: "edit" },
  { label: "4. Template Email", slot: "template" },
  { label: "5. Preview & Kirim", slot: "preview" },
];

const rows = ref<Record<string, any>[]>([]);
const editableRows = ref<Record<string, any>[]>([]);
const columns = ref<string[]>([]);
const parseError = ref("");
const isSending = ref(false);

const sheetNames = ref<string[]>([]);
const selectedSheet = ref("");
const sheetOptions = computed(() => sheetNames.value.map((name) => ({ label: name, value: name })));
const headerRowIndex = ref(1);
const workbookRef = ref<any>(null);
const autoParse = ref(false);
const mappingTouched = ref(false);
let isSettingMapping = false;

const mappingEntries = ref([
  { id: "email", label: "Email", placeholder: "email", required: true, column: "" },
  { id: "nama-kandidat", label: "Nama", placeholder: "nama-kandidat", required: true, column: "" },
  { id: "lowongan", label: "Lowongan", placeholder: "lowongan", required: true, column: "" },
]);

const optionalMappingOptions = computed(() => {
  const available = [
    { id: "username", label: "Username", placeholder: "username" },
    { id: "password", label: "Password", placeholder: "password" },
  ];
  return available
    .filter((item) => !mappingEntries.value.some((entry) => entry.id === item.id))
    .map((item) => ({ label: item.label, value: item.id }));
});

const selectedOptional = ref<string | null>(null);

function addMapping() {
  const target = selectedOptional.value;
  if (!target) return;
  const label = target === "username" ? "Username" : "Password";
  mappingEntries.value.push({
    id: target,
    label,
    placeholder: target,
    required: false,
    column: "",
  });
  selectedOptional.value = null;
  mappingTouched.value = true;
}

function removeMapping(id: string) {
  mappingEntries.value = mappingEntries.value.filter((entry) => entry.id !== id);
  mappingTouched.value = true;
}

watch(
  mappingEntries,
  () => {
    if (!isSettingMapping) {
      mappingTouched.value = true;
    }
  },
  { deep: true }
);

const columnOptions = computed(() => columns.value.map((col) => ({ label: col, value: col })));

function normalizeCell(value: any) {
  if (value == null) return "";
  return String(value).trim();
}

function findHeaderRowIndex(table: any[][]) {
  const keywords = ["nama", "email", "e-mail", "posisi", "lowongan", "username", "password"];
  for (let i = 0; i < table.length; i += 1) {
    const row = table[i].map((cell) => normalizeCell(cell).toLowerCase());
    if (row.some((cell) => keywords.includes(cell))) {
      return i + 1; // 1-based
    }
  }
  return 1;
}

function parseSheet() {
  const workbook = workbookRef.value;
  if (!workbook || !selectedSheet.value) return;

  const sheet = workbook.Sheets[selectedSheet.value];
  const table = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

  if (!table.length) {
    rows.value = [];
    columns.value = [];
    return;
  }

  if (!headerRowIndex.value || headerRowIndex.value < 1) {
    headerRowIndex.value = 1;
  }

  const headerRow = table[headerRowIndex.value - 1] || [];
  const headerCounts: Record<string, number> = {};
  const headers = headerRow.map((cell, idx) => {
    const base = normalizeCell(cell) || `Column ${idx + 1}`;
    const count = headerCounts[base] || 0;
    headerCounts[base] = count + 1;
    return count > 0 ? `${base} (${count + 1})` : base;
  });

  const dataRows = table.slice(headerRowIndex.value).filter((row) =>
    row.some((cell) => String(cell || "").trim() !== "")
  );

  rows.value = dataRows.map((row) => {
    const record: Record<string, any> = {};
    headers.forEach((header, idx) => {
      record[header] = row[idx] ?? "";
    });
    return record;
  });

  editableRows.value = rows.value.map((row) => ({ ...row }));
  columns.value = headers;
  setDefaultMapping();
}

function setDefaultMapping() {
  if (mappingTouched.value) return;
  isSettingMapping = true;
  const lowerCols = columns.value.map((col) => col.toLowerCase());
  const find = (patterns: RegExp[]) => {
    const idx = lowerCols.findIndex((col) => patterns.some((pattern) => pattern.test(col)));
    return idx >= 0 ? columns.value[idx] : "";
  };

  const emailEntry = mappingEntries.value.find((entry) => entry.id === "email");
  const nameEntry = mappingEntries.value.find((entry) => entry.id === "nama-kandidat");
  const positionEntry = mappingEntries.value.find((entry) => entry.id === "lowongan");

  if (emailEntry) emailEntry.column = find([/email/]);
  if (nameEntry) nameEntry.column = find([/nama/]);
  if (positionEntry) positionEntry.column = find([/lowongan/, /posisi/]);

  const usernameEntry = mappingEntries.value.find((entry) => entry.id === "username");
  if (usernameEntry) usernameEntry.column = find([/username/]);

  const passwordEntry = mappingEntries.value.find((entry) => entry.id === "password");
  if (passwordEntry) passwordEntry.column = find([/password/]);

  isSettingMapping = false;
}

async function handleFileChange(event: Event) {
  parseError.value = "";
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    workbookRef.value = workbook;
    sheetNames.value = workbook.SheetNames;
    selectedSheet.value =
      workbook.SheetNames.find((name) => name.toLowerCase().includes("rekapan")) ||
      workbook.SheetNames[0] ||
      "";

    const sheet = workbook.Sheets[selectedSheet.value];
    const table = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
    headerRowIndex.value = findHeaderRowIndex(table);
    mappingTouched.value = false;
  } catch (error: any) {
    parseError.value = error?.message || "Gagal membaca file Excel.";
  }
}

function loadDataFromExcel() {
  if (!workbookRef.value || !selectedSheet.value) {
    parseError.value = "Pilih file dan sheet terlebih dahulu.";
    return;
  }
  autoParse.value = true;
  parseSheet();
}

watch(selectedSheet, () => {
  if (autoParse.value) {
    mappingTouched.value = false;
    parseSheet();
  }
});

watch(headerRowIndex, () => {
  if (autoParse.value) parseSheet();
});

const mappingMap = computed(() => {
  const map: Record<string, string> = {};
  for (const entry of mappingEntries.value) {
    map[entry.placeholder] = entry.column || "";
  }
  return map;
});

const mappingKeys = computed(() => ({
  email: mappingMap.value.email,
  name: mappingMap.value["nama-kandidat"],
  position: mappingMap.value.lowongan,
  username: mappingMap.value.username,
  password: mappingMap.value.password,
}));

const needsUsername = computed(() => templateBody.value.includes("[username]"));
const needsPassword = computed(() => templateBody.value.includes("[password]"));

const requiredFields = computed(() => ({
  email: true,
  name: true,
  position: true,
  username: needsUsername.value,
  password: needsPassword.value,
}));

function showColumn(id: string) {
  return mappingEntries.value.some((entry) => entry.id === id);
}

function getCellValue(rowIndex: number, key: string) {
  if (!key) return "";
  return String(editableRows.value[rowIndex]?.[key] ?? "");
}

function setCellValue(rowIndex: number, key: string, value: any) {
  if (!key) return;
  if (!editableRows.value[rowIndex]) return;
  editableRows.value[rowIndex][key] = value;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  if (!value) return false;
  return emailPattern.test(value.trim());
}

function inputClass(value: string, required: boolean, kind?: "email") {
  if (!required) return "";
  if (!value || !value.trim()) {
    return "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500";
  }
  if (kind === "email" && !isValidEmail(value)) {
    return "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500";
  }
  return "";
}

const mappedRecipients = computed(() =>
  editableRows.value.map((row) => ({
    email: String(row[mappingKeys.value.email] || "").trim(),
    nama: String(row[mappingKeys.value.name] || "").trim(),
    lowongan: String(row[mappingKeys.value.position] || "").trim(),
    username: String(row[mappingKeys.value.username] || "").trim(),
    password: String(row[mappingKeys.value.password] || "").trim(),
  }))
);

const validRecipients = computed(() =>
  mappedRecipients.value.filter((item) => {
    if (!item.email || !isValidEmail(item.email)) return false;
    if (!item.nama || !item.lowongan) return false;
    if (needsUsername.value && !item.username) return false;
    if (needsPassword.value && !item.password) return false;
    return true;
  })
);

const previewTableRows = computed(() =>
  mappedRecipients.value.map((item) => ({
    ...item,
    target: (testEmail.value || "").trim() || item.email,
    status: validRecipients.value.includes(item) ? "valid" : "invalid",
  }))
);

const previewColumns = computed(() => {
  const base = [
    { key: "email", label: "Email" },
    { key: "nama", label: "Nama" },
    { key: "lowongan", label: "Lowongan" },
  ];
  if (testEmail.value) {
    base.splice(1, 0, { key: "target", label: "Kirim ke" });
  }
  if (showColumn("username")) base.push({ key: "username", label: "Username" });
  if (showColumn("password")) base.push({ key: "password", label: "Password" });
  base.push({ key: "status", label: "Status" });
  return base;
});

const editColumns = computed(() => {
  const base = [
    { key: "email", label: "Email" },
    { key: "nama", label: "Nama" },
    { key: "lowongan", label: "Lowongan" },
  ];
  if (showColumn("username")) base.push({ key: "username", label: "Username" });
  if (showColumn("password")) base.push({ key: "password", label: "Password" });
  base.push({ key: "actions", label: "" });
  return base;
});

const editTableRows = computed(() =>
  editableRows.value.map((row, idx) => ({ ...row, _rowIndex: idx }))
);

const editFilter = ref("");
const editFilterMode = ref("all");
const filterModeOptions = [
  { label: "Semua", value: "all" },
  { label: "Invalid saja", value: "invalid" },
  { label: "Valid saja", value: "valid" },
];

const filteredEditRows = computed(() => {
  const query = editFilter.value.toLowerCase();
  return editTableRows.value.filter((row) => {
    const mapped = mappedRecipients.value[row._rowIndex];
    if (!mapped) return false;
    if (editFilterMode.value === "valid" && !validRecipients.value.includes(mapped)) return false;
    if (editFilterMode.value === "invalid" && validRecipients.value.includes(mapped)) return false;

    if (!query) return true;
    return (
      mapped.email.toLowerCase().includes(query) ||
      mapped.nama.toLowerCase().includes(query) ||
      mapped.lowongan.toLowerCase().includes(query) ||
      mapped.username.toLowerCase().includes(query)
    );
  });
});

const selectedRows = ref<any[]>([]);
const showPasswords = ref(false);

function removeRow(index: number) {
  if (index < 0 || index >= editableRows.value.length) return;
  if (!window.confirm("Hapus baris ini dari data?")) return;
  editableRows.value.splice(index, 1);
  selectedRows.value = selectedRows.value.filter((row) => row._rowIndex !== index);
}

function bulkDelete() {
  if (selectedRows.value.length === 0) return;
  if (!window.confirm(`Hapus ${selectedRows.value.length} baris terpilih?`)) return;
  const indexes = selectedRows.value.map((row) => row._rowIndex).sort((a, b) => b - a);
  for (const idx of indexes) {
    if (idx >= 0 && idx < editableRows.value.length) {
      editableRows.value.splice(idx, 1);
    }
  }
  selectedRows.value = [];
}

const previewPage = ref(1);
const previewPageSize = ref(10);
const previewTotal = computed(() => previewTableRows.value.length);
const pagedPreviewRows = computed(() => {
  const start = (previewPage.value - 1) * previewPageSize.value;
  const end = start + previewPageSize.value;
  return previewTableRows.value.slice(start, end);
});

watch([previewPageSize, mappedRecipients], () => {
  previewPage.value = 1;
});

const toast = useToast();

const { data: templatesResponse, refresh: refreshTemplates } = await useAsyncData(
  "email-templates",
  () => $fetch("/api/admin/email-templates"),
  { default: () => ({ data: [] }) }
);

const templates = computed(() => (templatesResponse.value as any)?.data ?? []);
const templateOptions = computed(() =>
  templates.value.map((item: any) => ({ label: item.name, value: item.id }))
);

const selectedTemplateId = ref<string | null>(null);
const templateName = ref("");
const templateSubject = ref("");
const templateBody = ref("");

watch(
  templates,
  (value) => {
    if (!selectedTemplateId.value && value.length) {
      selectedTemplateId.value = value[0].id;
    }
  },
  { immediate: true }
);

watch(
  selectedTemplateId,
  (id) => {
    const tpl = templates.value.find((item: any) => item.id === id);
    if (tpl) {
      templateName.value = tpl.name;
      templateSubject.value = tpl.subject;
      templateBody.value = tpl.body;
    }
  },
  { immediate: true }
);

function createNewTemplate() {
  selectedTemplateId.value = null;
  templateName.value = "Template Baru";
  templateSubject.value = "";
  templateBody.value = "";
}

async function saveTemplate() {
  try {
    if (selectedTemplateId.value) {
      await $fetch(`/api/admin/email-templates/${selectedTemplateId.value}`, {
        method: "PUT",
        body: {
          name: templateName.value,
          subject: templateSubject.value,
          body: templateBody.value,
        },
      });
      toast.add({ title: "Template diperbarui", color: "green" });
    } else {
      const created: any = await $fetch("/api/admin/email-templates", {
        method: "POST",
        body: {
          name: templateName.value,
          subject: templateSubject.value,
          body: templateBody.value,
        },
      });
      selectedTemplateId.value = created?.data?.id || null;
      toast.add({ title: "Template disimpan", color: "green" });
    }
    await refreshTemplates();
  } catch (error: any) {
    toast.add({
      title: "Gagal menyimpan template",
      description: error?.data?.error?.message || "Coba lagi.",
      color: "red",
    });
  }
}

async function deleteTemplate() {
  if (!selectedTemplateId.value) return;
  if (!window.confirm("Hapus template ini?")) return;
  try {
    await $fetch(`/api/admin/email-templates/${selectedTemplateId.value}`, { method: "DELETE" });
    selectedTemplateId.value = null;
    await refreshTemplates();
    toast.add({ title: "Template dihapus", color: "green" });
  } catch (error: any) {
    toast.add({ title: "Gagal menghapus template", color: "red" });
  }
}

const testEmail = ref("");

const canSend = computed(() => {
  if (rows.value.length === 0) return false;
  if (!mappingKeys.value.email || !mappingKeys.value.name || !mappingKeys.value.position) return false;
  if (!templateBody.value) return false;
  return validRecipients.value.length > 0 && !isSending.value;
});

function applyPlaceholders(value: string, payload: Record<string, string>) {
  let output = value || "";
  for (const [key, val] of Object.entries(payload)) {
    output = output.replaceAll(`[${key}]`, val ?? "");
  }
  return output;
}

const previewEmail = computed(() => {
  const first = validRecipients.value[0];
  if (!first) {
    return { subject: "-", body: "-" };
  }
  const payload = {
    "nama-kandidat": first.nama,
    lowongan: first.lowongan,
    username: first.username || "",
    password: first.password || "",
    email: first.email || "",
  };
  const subjectText = applyPlaceholders(templateSubject.value || "Email Informasi", payload);
  const bodyText = applyPlaceholders(templateBody.value || "", payload);
  return { subject: subjectText, body: bodyText };
});

async function sendBlast() {
  try {
    if (testEmail.value && !isValidEmail(testEmail.value)) {
      toast.add({
        title: "Test email tidak valid",
        description: "Periksa format email pada kolom Test Email.",
        color: "red",
      });
      return;
    }
    if (testEmail.value) {
      const confirmSend = window.confirm(
        `Mode test aktif. Semua email akan dikirim ke ${testEmail.value}. Lanjutkan?`
      );
      if (!confirmSend) return;
    }
    isSending.value = true;
    const payload = {
      templateId: selectedTemplateId.value || undefined,
      subject: templateSubject.value || undefined,
      body: templateBody.value,
      testEmail: testEmail.value || undefined,
      recipients: validRecipients.value,
    };

    const res: any = await $fetch("/api/admin/email-blast", {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Email blast dikirim",
      description: `Terkirim: ${res?.data?.sent ?? 0}, skip: ${res?.data?.skipped ?? 0}`,
      color: "green",
    });
  } catch (error: any) {
    toast.add({
      title: "Gagal mengirim email",
      description: error?.data?.error?.message || "Periksa konfigurasi SMTP dan data excel.",
      color: "red",
    });
  } finally {
    isSending.value = false;
  }
}
</script>
