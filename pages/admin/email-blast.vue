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

    <div v-if="activeCampaign" class="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-amber-800">{{ activeCampaign.name }}</h3>
          <div class="mt-3">
            <UProgress :value="activeCampaign.progressPercent" color="amber" size="md" />
          </div>
          <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-700">
            <span>Terkirim: <strong>{{ activeCampaign.sent }}</strong> / {{ activeCampaign.total }}</span>
            <span v-if="activeCampaign.failed > 0">Gagal: <strong class="text-red-600">{{ activeCampaign.failed }}</strong></span>
            <span v-if="activeCampaign.skipped > 0">Skip: {{ activeCampaign.skipped }}</span>
            <span v-if="activeCampaign.status === 'running' && activeCampaign.estimatedRemainingSeconds > 0">
              Estimasi sisa: <strong>{{ formatTime(activeCampaign.estimatedRemainingSeconds) }}</strong>
            </span>
            <UBadge v-if="activeCampaign.status === 'done'" color="green" variant="soft" size="xs">Selesai</UBadge>
            <UBadge v-if="activeCampaign.status === 'cancelled'" color="red" variant="soft" size="xs">Dibatalkan</UBadge>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="activeCampaign.status === 'running'"
            size="xs"
            color="red"
            variant="soft"
            @click="cancelBlast"
          >
            Batalkan
          </UButton>
          <UButton
            v-if="activeCampaign.status !== 'running'"
            size="xs"
            color="gray"
            variant="soft"
            @click="dismissCampaign"
          >
            Tutup
          </UButton>
        </div>
      </div>
    </div>

    <UAccordion v-if="!activeCampaign || activeCampaign.status !== 'running'" multiple :items="accordionItems" :ui="{ wrapper: 'space-y-4' }">
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
                Pastikan file berisi kolom email dan nama kandidat.
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
              Wajib: <span class="font-medium text-gray-700">Email, Nama</span>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <USelectMenu
              v-model="loadedMappingId"
              :options="mappingConfigOptions"
              placeholder="Muat mapping tersimpan"
              value-attribute="value"
              class="w-full sm:w-56"
            />
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              :disabled="!loadedMappingId"
              @click="loadMapping"
            >
              Muat
            </UButton>
            <UButton
              v-if="loadedMappingId"
              size="xs"
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              class="sm:ml-1"
              @click="deleteMappingConfig"
            />
            <UButton
              size="xs"
              color="green"
              variant="soft"
              :disabled="!mappingEntries[0]?.column || columns.length === 0"
              @click="openSaveMappingDialog"
              class="sm:ml-auto"
            >
              Simpan Mapping
            </UButton>
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
              <UInput
                v-model="newMappingName"
                size="xs"
                placeholder="Nama placeholder, cth: alamat"
                class="w-full sm:w-56"
                @keyup.enter="addMapping"
              />
              <UButton
                size="xs"
                color="primary"
                variant="soft"
                :disabled="!newMappingName.trim()"
                @click="addMapping"
              >
                Tambah Mapping
              </UButton>
            </div>
          </div>

          <UAlert v-if="rows.length === 0" color="gray" variant="soft" icon="i-heroicons-information-circle" class="mt-3">
            Upload file terlebih dahulu untuk melihat opsi kolom.
          </UAlert>

          <UModal v-model="saveMappingModalOpen" :ui="{ width: 'sm:max-w-md' }">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Simpan Mapping</h3>
              <UFormGroup label="Nama Mapping" required>
                <UInput v-model="saveMappingName" placeholder="contoh: mapping rekrutmen" />
              </UFormGroup>
              <div class="mt-4 flex justify-end gap-2">
                <UButton size="sm" color="gray" variant="soft" @click="saveMappingModalOpen = false">
                  Batal
                </UButton>
                <UButton size="sm" color="primary" :disabled="!saveMappingName.trim()" @click="saveMapping">
                  Simpan
                </UButton>
              </div>
            </div>
          </UModal>
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
                placeholder="Cari nama/email"
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

          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Baris per halaman</span>
              <USelect v-model="editPageSize" :options="[10, 20, 50, 100]" size="xs" class="w-24" />
            </div>
            <span class="text-xs text-gray-500">Total: {{ editTotal }} baris</span>
          </div>

          <div class="mt-3 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
            <UTable
              v-model="selectedRows"
              class="min-w-[720px] w-full"
              :rows="pagedEditRows"
              :columns="editColumns"
              :empty-state="{ icon: 'i-heroicons-inbox', label: 'Tidak ada data' }"
            >
              <template v-for="entry in dynamicColumns" :key="entry.id" #[entry.id+'-data']="{ row }">
                <UInput
                  :model-value="getCellValue(row._rowIndex, entry.column)"
                  @update:model-value="(val) => setCellValue(row._rowIndex, entry.column, val)"
                  size="xs"
                  :disabled="!entry.column"
                  :type="entry.placeholder === 'password' && !showPasswords ? 'password' : 'text'"
                  :class="inputClass(getCellValue(row._rowIndex, entry.column), requiredFields[entry.placeholder] || false, entry.placeholder === 'email' ? 'email' : undefined)"
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

          <div class="mt-3">
            <UPagination
              v-model="editPage"
              :page-count="editPageSize"
              :total="editTotal"
              :ui="{ wrapper: 'flex flex-wrap items-center gap-2 justify-center sm:justify-start' }"
            />
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
                <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
                  <label
                    v-for="t in templates"
                    :key="t.id"
                    class="flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm transition"
                    :class="selectedTemplateId === t.id ? 'border-green-600 bg-green-50/50 ring-1 ring-green-600' : 'border-gray-200 hover:border-gray-300'"
                    @click="selectedTemplateId = t.id"
                  >
                    <UCheckbox :model-value="selectedTemplateId === t.id" />
                    <span class="min-w-0 flex-1">
                      <span class="block truncate font-medium text-gray-800">{{ t.name }}</span>
                      <span class="block truncate text-xs text-gray-400">{{ t.subject }}</span>
                    </span>
                    <UBadge v-if="isHtmlBody(t.body)" color="green" variant="soft" size="xs">HTML</UBadge>
                  </label>
                </div>
              </UFormGroup>

              <UFormGroup label="Pilih Warna">
                <div class="flex flex-wrap gap-3">
                  <label
                    v-for="pal in EMAIL_PALETTES"
                    :key="pal.id"
                    class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700"
                  >
                    <UCheckbox :model-value="selectedPalette === pal.id" @update:model-value="selectedPalette = pal.id" />
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: pal.swatch }"></span>
                      {{ pal.label }}
                    </span>
                  </label>
                  <label class="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700">
                    <UCheckbox :model-value="selectedPalette === 'custom'" @update:model-value="selectedPalette = 'custom'" />
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: effectivePaletteId }"></span>
                      Custom
                    </span>
                  </label>
                </div>
                <div v-if="selectedPalette === 'custom'" class="mt-2 flex items-center gap-2">
                  <input
                    v-model="customColor"
                    type="color"
                    class="h-8 w-12 cursor-pointer rounded border border-gray-200 bg-transparent p-0"
                  />
                  <UInput v-model="customColor" placeholder="#3b82f6" class="w-36" />
                </div>
              </UFormGroup>

              <UFormGroup label="Isi Konten (berlaku untuk semua template)">
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="f in TEMPLATE_FIELDS" :key="f.placeholder">
                    <label class="mb-1 block text-xs text-gray-500">{{ f.label }}</label>
                    <UTextarea
                      v-if="f.type === 'textarea'"
                      v-model="templateFieldValues[f.placeholder]"
                      rows="2"
                      :placeholder="`[${f.placeholder}]`"
                    />
                    <UInput
                      v-else
                      :type="f.type"
                      v-model="templateFieldValues[f.placeholder]"
                      :placeholder="`[${f.placeholder}]`"
                    />
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  Kosongkan untuk memakai data Excel. Nilai yang diisi akan menimpa data Excel dan langsung tampil di preview.
                </p>
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
            </div>

            <div class="min-w-0">
              <UFormGroup label="Body">
                <UTextarea
                  :model-value="mergedBody"
                  rows="12"
                  :placeholder="availablePlaceholders"
                  @update:model-value="updateBody"
                />
              </UFormGroup>
              <p v-if="isHtmlBody(templateBody)" class="mt-2 text-xs text-gray-400">
                Template ini berformat HTML/CSS. Placeholder data dan warna akan diganti otomatis saat dikirim.
              </p>
              <p v-else class="mt-2 text-xs text-gray-400">
                Nilai terisi dari "Isi Konten" langsung tampil di sini (live merge). Ubah nilainya di kolom "Isi Konten".
              </p>
            </div>
          </div>

          <div v-if="selectedTemplateId" class="mt-6">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-semibold text-gray-700">Preview Email</span>
              <span class="text-xs text-gray-400">Frame & konten tersinkron dengan template yang dipilih dan kolom Body</span>
            </div>
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div class="mb-2 text-xs text-gray-500">
                <span class="font-semibold text-gray-700">Subject:</span> {{ templatePreview.subject }}
              </div>
              <iframe
                v-if="templatePreview.html"
                :srcdoc="templatePreview.html"
                sandbox=""
                class="h-[520px] w-full rounded-lg border border-gray-200 bg-white"
              ></iframe>
              <pre v-else class="whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">{{ templatePreview.body }}</pre>
            </div>
          </div>
        </div>
      </template>

      <template #manual>
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900">Kirim Email Manual</div>
              <div class="text-xs text-gray-500">
                Tambahkan penerima satu per satu seperti mengirim email biasa. Gunakan template yang sudah dibuat.
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton size="xs" color="primary" variant="soft" @click="addManualRecipient">
                Tambah ke Daftar
              </UButton>
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <UFormGroup label="Email" required>
              <UInput
                v-model="manualForm.email"
                placeholder="contoh@domain.com"
                :class="inputClass(manualForm.email, true, 'email')"
              />
            </UFormGroup>
            <UFormGroup label="Nama" required>
              <UInput v-model="manualForm[namePlaceholder]" placeholder="Nama penerima" :class="inputClass(manualForm[namePlaceholder], true)" />
            </UFormGroup>
            <UFormGroup
              v-for="entry in mappingEntries.filter(e => !e.required && e.id !== 'email' && e.id !== 'nama-kandidat')"
              :key="entry.id"
              :label="entry.label"
              :required="needsPlaceholder(entry.placeholder)"
            >
              <UInput
                v-model="manualForm[entry.placeholder]"
                :placeholder="entry.label.toLowerCase()"
              />
            </UFormGroup>
          </div>

          <UAlert v-if="manualError" color="red" variant="soft" icon="i-heroicons-exclamation-triangle" class="mt-3">
            {{ manualError }}
          </UAlert>

          <UAlert
            v-if="testEmail"
            color="amber"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            class="mt-3"
          >
            Mode test aktif. Email manual akan dikirim ke <strong>{{ testEmail }}</strong>.
          </UAlert>

          <div class="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
            <UTable
              class="min-w-[680px] w-full"
              :rows="manualRecipients"
              :columns="manualColumns"
              :empty-state="{ icon: 'i-heroicons-inbox', label: 'Belum ada penerima' }"
            >
              <template #status-data="{ row }">
                <span
                  :class="
                    row.status === 'sent'
                      ? 'text-emerald-600'
                      : row.status === 'failed'
                        ? 'text-rose-600'
                        : 'text-gray-400'
                  "
                >
                  {{ row.statusLabel || "-" }}
                </span>
              </template>
              <template #actions-data="{ row }">
                <div class="flex items-center gap-2">
                  <UButton
                    size="xs"
                    color="primary"
                    :loading="manualSendingId === row.id"
                    @click="sendManualRecipient(row)"
                  >
                    Kirim
                  </UButton>
                  <UButton size="xs" color="red" variant="soft" @click="removeManualRecipient(row.id)">
                    Hapus
                  </UButton>
                </div>
              </template>
            </UTable>
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
                />
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
                  <div v-if="previewEmail.html">
                    <span class="font-semibold">Tampilan Email:</span>
                    <iframe :srcdoc="previewEmail.html" sandbox="" class="mt-1 h-[420px] w-full rounded-lg border border-gray-200"></iframe>
                  </div>
                  <div v-else>
                    <span class="font-semibold">Body:</span>
                    <pre class="mt-1 whitespace-pre-wrap text-gray-700">{{ previewEmail.body }}</pre>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border border-gray-100 p-4">
                <UFormGroup label="Nama Campaign" required>
                  <UInput v-model="campaignName" placeholder="Contoh: Konfirmasi Resume Juni 2026" />
                </UFormGroup>
                <UCheckbox
                  v-model="noreply"
                  label="Kirim sebagai No-Reply (penerima tidak bisa membalas)"
                  class="mt-3"
                />
                <div class="mt-3 flex flex-col gap-2">
                  <UButton
                    color="primary"
                    size="lg"
                    :loading="isSending"
                    :disabled="!canSend || !!activeCampaign"
                    class="w-full"
                    @click="sendBlast"
                  >
                    Kirim Email Blast
                  </UButton>
                  <p v-if="!canSend" class="text-xs text-gray-500">
                    Pastikan data valid, template lengkap, dan nama campaign diisi.
                  </p>
                  <p v-if="!!activeCampaign && activeCampaign.status === 'running'" class="text-xs text-amber-600">
                    Masih ada proses blast berjalan. Tunggu selesai atau batalkan terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>

    <div v-if="campaigns.length" class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div class="text-sm font-semibold text-gray-900 mb-4">Riwayat Blast</div>
      <div class="space-y-3">
        <div
          v-for="c in campaigns"
          :key="c.campaignId"
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-100 p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800 truncate">{{ c.name }}</span>
              <UBadge
                :color="c.status === 'done' ? 'green' : c.status === 'cancelled' ? 'red' : 'amber'"
                variant="soft"
                size="xs"
                :label="c.status === 'done' ? 'Selesai' : c.status === 'cancelled' ? 'Dibatalkan' : 'Berjalan'"
              />
            </div>
            <div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
              <span>{{ formatDateTime(c.createdAt) }}</span>
              <span v-if="c.status !== 'running'" class="text-green-600">
                Terkirim: {{ c.sent }} / {{ c.total }}
              </span>
              <span v-if="c.failed > 0" class="text-red-500">Gagal: {{ c.failed }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:shrink-0">
            <div class="flex items-center gap-2">
              <UProgress :value="c.progressPercent" size="xs" class="w-20 sm:w-28" />
              <span class="text-xs text-gray-500 w-8 text-right">{{ c.progressPercent }}%</span>
            </div>
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              icon="i-heroicons-eye"
              @click="openLogDetail(c)"
            >
              Detail
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="logModalOpen" :ui="{ width: 'sm:max-w-5xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Detail Log — {{ logCampaign?.name }}
            </h3>
            <p class="text-xs text-gray-500">
              Terkirim: {{ logSentCount }} · Gagal: {{ logFailedCount }} · Total: {{ logTotal }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              size="xs"
              color="gray"
              variant="soft"
              :loading="logExportLoading"
              @click="exportLogCSV"
            >
              Export CSV
            </UButton>
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="logModalOpen = false"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div class="flex items-center gap-2">
            <UButton
              v-for="tab in logStatusTabs"
              :key="tab.value"
              size="xs"
              :color="logStatusFilter === tab.value ? 'primary' : 'gray'"
              :variant="logStatusFilter === tab.value ? 'solid' : 'soft'"
              @click="setLogFilter(tab.value)"
            >
              {{ tab.label }}
            </UButton>
          </div>
          <UInput
            v-model="logSearch"
            size="xs"
              placeholder="Cari email, nama..."
            icon="i-heroicons-magnifying-glass"
            class="w-full sm:w-64"
          />
        </div>

        <div class="w-full overflow-x-auto">
          <UTable
            :rows="logItems"
            :columns="logColumns"
            :loading="logLoading"
            :empty-state="{ icon: 'i-heroicons-inbox', label: 'Tidak ada log' }"
          >
            <template #recipientName-data="{ row }">
              <span class="text-sm text-gray-700">{{ row.recipientName || row.recipientData?.["nama-kandidat"] || row.recipientData?.nama || "-" }}</span>
            </template>
            <template #status-data="{ row }">
              <UBadge
                :color="row.status === 'sent' ? 'green' : row.status === 'failed' ? 'red' : 'gray'"
                variant="soft"
                size="xs"
                :label="row.status === 'sent' ? 'Terkirim' : row.status === 'failed' ? 'Gagal' : 'Skip'"
              />
            </template>
            <template #error-data="{ row }">
              <span class="text-xs text-red-500 max-w-[200px] truncate block">{{ row.error || "-" }}</span>
            </template>
            <template #waktu-data="{ row }">
              <span class="text-xs whitespace-nowrap">
                {{ formatDateTime(row.sentAt || row.failedAt || row.createdAt) }}
              </span>
            </template>
          </UTable>
        </div>

        <div class="mt-4 flex justify-center">
          <UPagination
            v-model="logPage"
            :page-count="logPageSize"
            :total="logTotal"
          />
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
import { EMAIL_PALETTES, applyPlaceholders, isHtmlBody, applyPalette, isHexColor } from "~/utils/emailHtml";

definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});

const accordionItems = [
  { label: "1. Upload Excel", slot: "upload" },
  { label: "2. Mapping Kolom", slot: "mapping" },
  { label: "3. Edit Data (Opsional)", slot: "edit" },
  { label: "4. Template Email", slot: "template" },
  { label: "5. Kirim Manual (Satu per Satu)", slot: "manual" },
  { label: "6. Preview & Kirim", slot: "preview" },
];

const rows = ref<Record<string, any>[]>([]);
const editableRows = ref<Record<string, any>[]>([]);
const columns = ref<string[]>([]);
const parseError = ref("");
const isSending = ref(false);

const sheetNames = ref<string[]>([]);
const selectedSheet = ref("");
const selectedFileName = ref("");
const sheetOptions = computed(() => sheetNames.value.map((name) => ({ label: name, value: name })));
const headerRowIndex = ref(1);
const workbookRef = ref<any>(null);
const autoParse = ref(false);
const mappingTouched = ref(false);
let isSettingMapping = false;

type MappingEntry = { id: string; label: string; placeholder: string; required: boolean; column: string };

const STORAGE_KEY = "email-blast:v2";

const mappingEntries = ref<MappingEntry[]>([
  { id: "email", label: "Email", placeholder: "email", required: true, column: "" },
  { id: "nama-kandidat", label: "Nama", placeholder: "nama-kandidat", required: true, column: "" },
]);

const newMappingName = ref("");

const patternMap: Record<string, RegExp[]> = {
  email: [/email/],
  "nama-kandidat": [/nama/],
  lowongan: [/lowongan/, /posisi/, /melamar/],
  username: [/username/],
  password: [/password/],
  "link-konfirmasi": [/link/, /konfirmasi/],
  "tanggal-melamar": [/tanggal/, /melamar/],
  "nomor-hp": [/nomor hp/, /hp/, /telepon/],
  "pesan-konfirmasi": [/pesan/],
};

function autoDetectColumn(id: string): string {
  if (columns.value.length === 0) return "";
  const lowerCols = columns.value.map((col) => col.toLowerCase());
  const patterns = patternMap[id] || [];
  const idx = lowerCols.findIndex((col) => patterns.some((p) => p.test(col)));
  return idx >= 0 ? columns.value[idx] : "";
}

function autoDetectPlaceholder(column: string): string | null {
  const lower = column.toLowerCase();
  for (const [id, patterns] of Object.entries(patternMap)) {
    if (patterns.some((p) => p.test(lower))) {
      return id;
    }
  }
  return null;
}

function addMapping() {
  const name = newMappingName.value.trim();
  if (!name) return;
  const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (!id || mappingEntries.value.some((e) => e.id === id)) return;

  isSettingMapping = true;
  const column = autoDetectColumn(id);
  mappingEntries.value.push({
    id,
    label: name,
    placeholder: id,
    required: false,
    column,
  });
  isSettingMapping = false;
  newMappingName.value = "";
  mappingTouched.value = true;
  saveToLocalStorage();
}

function removeMapping(id: string) {
  mappingEntries.value = mappingEntries.value.filter((entry) => entry.id !== id);
  mappingTouched.value = true;
  saveToLocalStorage();
}

watch(
  mappingEntries,
  () => {
    if (!isSettingMapping) {
      mappingTouched.value = true;
      saveToLocalStorage();
    }
  },
  { deep: true }
);

function sanitizePlaceholder(col: string): string {
  return col.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function setDefaultMapping() {
  if (mappingTouched.value) return;
  isSettingMapping = true;

  for (const entry of mappingEntries.value) {
    if (!entry.column) {
      entry.column = autoDetectColumn(entry.id);
    }
  }

  const usedColumns = new Set(mappingEntries.value.map((e) => e.column).filter(Boolean));
  for (const col of columns.value) {
    if (usedColumns.has(col)) continue;
    if (!col || col.startsWith("Column ")) continue;

    const detected = autoDetectPlaceholder(col);
    const id = detected && !mappingEntries.value.some((e) => e.id === detected)
      ? detected
      : sanitizePlaceholder(col);
    if (!id || mappingEntries.value.some((e) => e.id === id || e.column === col)) continue;

    mappingEntries.value.push({
      id,
      label: col,
      placeholder: id,
      required: false,
      column: col,
    });
    usedColumns.add(col);
  }

  isSettingMapping = false;
}

function saveToLocalStorage() {
  try {
    const data = {
      rows: rows.value,
      columns: columns.value,
      mappingEntries: mappingEntries.value.map((e) => ({ ...e })),
      selectedSheet: selectedSheet.value,
      headerRowIndex: headerRowIndex.value,
      fileName: selectedFileName.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadFromLocalStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.rows?.length) return false;

    rows.value = data.rows || [];
    columns.value = data.columns || [];
    mappingEntries.value = data.mappingEntries || [];
    selectedSheet.value = data.selectedSheet || "";
    headerRowIndex.value = data.headerRowIndex || 1;
    if (data.fileName) selectedFileName.value = data.fileName;
    editableRows.value = (data.rows || []).map((row: any) => ({ ...row }));
    autoParse.value = true;
    mappingTouched.value = true;

    if (data.fileName && data.selectedSheet) {
      sheetNames.value = [data.selectedSheet];
    }
    return true;
  } catch {
    return false;
  }
}

function clearLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

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
  saveToLocalStorage();
}

async function handleFileChange(event: Event) {
  parseError.value = "";
  const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    selectedFileName.value = file.name;

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
    clearLocalStorage();
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

const mappingKeys = computed(() => {
  const keys: Record<string, string> = {};
  for (const entry of mappingEntries.value) {
    keys[entry.placeholder] = entry.column || "";
  }
  return keys;
});

const entryByPlaceholder = computed(() => {
  const map: Record<string, MappingEntry> = {};
  for (const entry of mappingEntries.value) {
    map[entry.placeholder] = entry;
  }
  return map;
});

function needsPlaceholder(placeholder: string) {
  return templateBody.value.includes(`[${placeholder}]`);
}

const requiredFields = computed(() => {
  const fields: Record<string, boolean> = {
    email: true,
    "nama-kandidat": true,
  };
  for (const entry of mappingEntries.value) {
    if (!entry.required && needsPlaceholder(entry.placeholder)) {
      fields[entry.placeholder] = true;
    }
  }
  return fields;
});

const dynamicColumns = computed(() =>
  mappingEntries.value.filter((e) => e.column)
);

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
  saveToLocalStorage();
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
  editableRows.value.map((row) => {
    const recipient: Record<string, string> = {};
    for (const entry of mappingEntries.value) {
      const colName = entry.column;
      recipient[entry.placeholder] = colName ? String(row[colName] ?? "").trim() : "";
    }
    return recipient;
  })
);

const validRecipients = computed(() =>
  mappedRecipients.value.filter((item) => {
    const email = item.email || "";
    if (!email || !isValidEmail(email)) return false;
    const nama = item["nama-kandidat"] || "";
    if (!nama) return false;
    for (const entry of mappingEntries.value) {
      if (needsPlaceholder(entry.placeholder) && !item[entry.placeholder]) return false;
    }
    return true;
  })
);

const previewTableRows = computed(() =>
  mappedRecipients.value.map((item) => {
    const masked = { ...item };
    if (!showPasswords.value && "password" in masked) {
      masked.password = "••••••";
    }
    return {
      ...masked,
      target: (testEmail.value || "").trim() || item.email,
      status: validRecipients.value.includes(item) ? "valid" : "invalid",
    };
  })
);

const previewColumns = computed(() => {
  const base = dynamicColumns.value.map((e) => ({ key: e.id, label: e.label }));
  if (testEmail.value) {
    base.splice(1, 0, { key: "target", label: "Kirim ke" });
  }
  base.push({ key: "status", label: "Status" });
  return base;
});

const editColumns = computed(() => {
  const cols = dynamicColumns.value.map((e) => ({ key: e.id, label: e.label }));
  cols.push({ key: "actions", label: "" });
  return cols;
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
    for (const entry of mappingEntries.value) {
      const val = mapped[entry.placeholder];
      if (val && val.toLowerCase().includes(query)) return true;
    }
    return false;
  });
});

const selectedRows = ref<any[]>([]);
const showPasswords = ref(false);

const editPage = ref(1);
const editPageSize = ref(20);
const editTotal = computed(() => filteredEditRows.value.length);
const pagedEditRows = computed(() => {
  const start = (editPage.value - 1) * editPageSize.value;
  return filteredEditRows.value.slice(start, start + editPageSize.value);
});

watch([editPageSize, editFilter, editFilterMode], () => {
  editPage.value = 1;
});

type ManualRecipient = {
  id: string;
  email: string;
  nama: string;
  status?: "sent" | "failed";
  statusLabel?: string;
  [key: string]: any;
};

const manualForm = reactive<Record<string, any>>({
  email: "",
});

const namePlaceholder = computed(() => {
  const entry = mappingEntries.value.find((e) => e.id === "nama-kandidat");
  return entry?.placeholder || "nama-kandidat";
});

const manualRecipients = ref<ManualRecipient[]>([]);
const manualError = ref("");
const manualSendingId = ref<string | null>(null);

function createManualId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const manualColumns = computed(() => {
  const cols = mappingEntries.value.map((e) => ({ key: e.id, label: e.label }));
  cols.push({ key: "status", label: "Status" });
  cols.push({ key: "actions", label: "" });
  return cols;
});

function validateManualForm() {
  if (!manualForm.email || !isValidEmail(manualForm.email)) {
    return "Email tidak valid.";
  }
  const nameVal = manualForm[namePlaceholder.value];
  if (!nameVal?.trim()) {
    return "Nama wajib diisi.";
  }
  for (const entry of mappingEntries.value) {
    if (!entry.required) continue;
    const val = manualForm[entry.placeholder];
    if (!val?.trim()) {
      return `${entry.label} wajib diisi karena template menggunakan [${entry.placeholder}].`;
    }
  }
  for (const entry of mappingEntries.value) {
    if (entry.required || !needsPlaceholder(entry.placeholder)) continue;
    const val = manualForm[entry.placeholder];
    if (!val?.trim()) {
      return `${entry.label} wajib diisi karena template menggunakan [${entry.placeholder}].`;
    }
  }
  return "";
}

function addManualRecipient() {
  manualError.value = "";
  const error = validateManualForm();
  if (error) {
    manualError.value = error;
    return;
  }

  const recipient: ManualRecipient = {
    id: createManualId(),
  };
  for (const entry of mappingEntries.value) {
    const val = manualForm[entry.placeholder] || "";
    (recipient as any)[entry.placeholder] = val.trim();
  }

  manualRecipients.value.push(recipient);

  for (const entry of mappingEntries.value) {
    manualForm[entry.placeholder] = "";
  }
  manualForm.email = "";
}

function removeManualRecipient(id: string) {
  manualRecipients.value = manualRecipients.value.filter((row) => row.id !== id);
}

async function sendManualRecipient(recipient: ManualRecipient) {
  if (!templateBody.value) {
    toast.add({
      title: "Template belum lengkap",
      description: "Lengkapi template email sebelum mengirim.",
      color: "red",
    });
    return;
  }

  if (manualSendingId.value) return;
  manualSendingId.value = recipient.id;
  recipient.status = undefined;
  recipient.statusLabel = "Mengirim...";

  try {
    const recipientData: Record<string, any> = {};
    for (const entry of mappingEntries.value) {
      recipientData[entry.placeholder] = recipient[entry.placeholder] || undefined;
    }

    const payload = {
      name: `Manual-${new Date().toLocaleString("id-ID")}`,
      templateId: selectedTemplateId.value || undefined,
      subject: templateSubject.value || undefined,
      body: templateBody.value,
      testEmail: testEmail.value || undefined,
      palette: selectedPalette.value || undefined,
      recipients: [recipientData],
    };

    const res: any = await $fetch("/api/admin/email-blast", {
      method: "POST",
      body: payload,
    });

    if (res?.data?.status === "running" || res?.data?.campaignId) {
      recipient.status = "sent";
      recipient.statusLabel = "Terkirim";
      toast.add({
        title: "Email dikirim",
        description: `Email dikirim ke ${recipient.email}.`,
        color: "green",
      });
    } else {
      recipient.status = "failed";
      recipient.statusLabel = "Gagal";
      toast.add({
        title: "Gagal mengirim email",
        description: "Email tidak terkirim. Periksa data dan SMTP.",
        color: "red",
      });
    }
  } catch (error: any) {
    recipient.status = "failed";
    recipient.statusLabel = "Gagal";
    toast.add({
      title: "Gagal mengirim email",
      description: error?.data?.error?.message || "Periksa konfigurasi SMTP dan data.",
      color: "red",
    });
  } finally {
    manualSendingId.value = null;
  }
}

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

const { data: mappingConfigsResponse, refresh: refreshMappingConfigs } = await useAsyncData(
  "mapping-configs",
  () => $fetch("/api/admin/mapping-configs"),
  { default: () => ({ data: [] }) }
);

const mappingConfigs = computed(() => (mappingConfigsResponse.value as any)?.data ?? []);
const mappingConfigOptions = computed(() =>
  mappingConfigs.value.map((item: any) => ({ label: item.name, value: item.id }))
);

const loadedMappingId = ref<string | null>(null);
const saveMappingModalOpen = ref(false);
const saveMappingName = ref("");

function openSaveMappingDialog() {
  saveMappingName.value = "";
  saveMappingModalOpen.value = true;
}

async function saveMapping() {
  if (!saveMappingName.value.trim()) return;
  try {
    await $fetch("/api/admin/mapping-configs", {
      method: "POST",
      body: {
        name: saveMappingName.value.trim(),
        mappings: mappingEntries.value.map((entry) => ({ ...entry })),
        columnsSnapshot: [...columns.value],
      },
    });
    saveMappingModalOpen.value = false;
    saveMappingName.value = "";
    await refreshMappingConfigs();
    toast.add({ title: "Mapping disimpan", color: "green" });
  } catch (error: any) {
    toast.add({
      title: "Gagal menyimpan mapping",
      description: error?.data?.error?.message || "Coba lagi.",
      color: "red",
    });
  }
}

async function loadMapping() {
  if (!loadedMappingId.value) return;
  const config = mappingConfigs.value.find((item: any) => item.id === loadedMappingId.value);
  if (!config) return;

  isSettingMapping = true;
  mappingEntries.value = config.mappings.map((m: any) => ({ ...m }));
  isSettingMapping = false;
  mappingTouched.value = true;

  toast.add({ title: `Mapping "${config.name}" dimuat`, color: "green" });
}

async function deleteMappingConfig() {
  if (!loadedMappingId.value) return;
  const config = mappingConfigs.value.find((item: any) => item.id === loadedMappingId.value);
  if (!config) return;
  if (!window.confirm(`Hapus mapping "${config.name}"?`)) return;

  try {
    await $fetch(`/api/admin/mapping-configs/${loadedMappingId.value}`, { method: "DELETE" });
    loadedMappingId.value = null;
    await refreshMappingConfigs();
    toast.add({ title: "Mapping dihapus", color: "green" });
  } catch (error: any) {
    toast.add({ title: "Gagal menghapus mapping", color: "red" });
  }
}

const templates = computed(() => (templatesResponse.value as any)?.data ?? []);

const selectedTemplateId = ref<string | null>(null);
const templateName = ref("");
const templateSubject = ref("");
const templateBody = ref("");

const selectedPalette = ref("hijau");
const customColor = ref("#3b82f6");

const effectivePaletteId = computed(() => {
  if (selectedPalette.value === "custom") {
    const hex = (customColor.value || "").trim();
    return isHexColor(hex) ? hex : "#3b82f6";
  }
  return selectedPalette.value;
});

const TEMPLATE_FIELDS = [
  { placeholder: "tanggal-tes", label: "Tanggal Tes", type: "date" },
  { placeholder: "waktu-tes", label: "Waktu Tes", type: "time" },
  { placeholder: "media-tes", label: "Media Tes", type: "text" },
  { placeholder: "link-zoom", label: "Tautan Zoom", type: "text" },
  { placeholder: "id-zoom", label: "ID Rapat Zoom", type: "text" },
  { placeholder: "password-zoom", label: "Kode Sandi Zoom", type: "text" },
  { placeholder: "link-konfirmasi", label: "Tautan Konfirmasi", type: "text" },
  { placeholder: "isi-pengumuman", label: "Isi Pengumuman", type: "textarea" },
] as const;

const templateFieldValues = ref<Record<string, string>>({});

const effectiveFieldValues = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  for (const f of TEMPLATE_FIELDS) {
    const raw = (templateFieldValues.value[f.placeholder] || "").trim();
    if (!raw) continue;
    if (f.type === "date") {
      const d = new Date(`${raw}T00:00:00`);
      if (!isNaN(d.getTime())) {
        out[f.placeholder] = d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        continue;
      }
    }
    out[f.placeholder] = raw;
  }
  return out;
});

const mergedBody = computed(() =>
  applyPlaceholders(templateBody.value || "", effectiveFieldValues.value)
);

const availablePlaceholders = computed(() => {
  const set = new Set<string>();
  for (const entry of mappingEntries.value) set.add(entry.placeholder);
  for (const f of TEMPLATE_FIELDS) set.add(f.placeholder);
  return `Placeholder tersedia: ${[...set].join(", ")}`;
});

function updateBody(value: string) {
  let raw = value || "";
  const filled = [...effectiveFieldValues.value.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );
  for (const [ph, val] of filled) {
    if (val && raw.includes(val)) {
      raw = raw.split(val).join(`[${ph}]`);
    }
  }
  templateBody.value = raw;
}

const SAMPLE_VALUES: Record<string, string> = {
  "nama-kandidat": "Budi Santoso",
  lowongan: "Perawat",
  username: "budi.santoso",
  password: "rahasia123",
  email: "kandidat@contoh.com",
  "link-konfirmasi": "https://app.sejahterasehatkaryautama.co.id/",
  "link-zoom": "https://us06web.zoom.us/j/0000000000",
  "id-zoom": "000 0000 0000",
  "password-zoom": "000000",
  "tanggal-tes": "Rabu, 5 Agustus 2026",
  "waktu-tes": "18.30 WIB - selesai",
  "media-tes": "Zoom Meeting",
  "tanggal-melamar": "28 Juli 2026",
  "isi-pengumuman": "Mohon menunggu informasi selanjutnya dari tim rekrutmen kami.",
};

const templatePlaceholders = computed(() => {
  const matches = templateBody.value.match(/\[([a-z0-9-]+)\]/gi) || [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
});

const templatePreviewPayload = computed<Record<string, string>>(() => {
  const first = validRecipients.value[0];
  const payload: Record<string, string> = {};
  for (const ph of templatePlaceholders.value) {
    const val = first?.[ph];
    payload[ph] = val || SAMPLE_VALUES[ph] || `[${ph}]`;
  }
  return { ...payload, ...effectiveFieldValues.value };
});

const templatePreview = computed(() => {
  const payload = templatePreviewPayload.value;
  const subject = applyPlaceholders(templateSubject.value || "Email Informasi", payload);
  const raw = applyPlaceholders(templateBody.value || "", payload);
  const html = isHtmlBody(raw)
    ? applyPalette(applyPlaceholders(templateBody.value || "", payload, true), effectivePaletteId.value)
    : "";
  return { subject, body: raw, html };
});

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
      templateFieldValues.value = { ...(tpl.fields || {}) };
    }
  },
  { immediate: true }
);

function createNewTemplate() {
  selectedTemplateId.value = null;
  templateName.value = "Template Baru";
  templateSubject.value = "";
  templateBody.value = "";
  templateFieldValues.value = {};
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
          fields: { ...templateFieldValues.value },
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
          fields: { ...templateFieldValues.value },
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
const campaignName = ref("");
const noreply = ref(false);
const activeCampaign = ref<any>(null);
const campaigns = ref<any[]>([]);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds} detik`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} menit ${secs} detik`;
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function fetchCampaigns() {
  try {
    const res: any = await $fetch("/api/admin/email-blast/campaigns?pageSize=10");
    campaigns.value = res?.data?.campaigns || res?.data?.recent || [];
    if (res?.data?.active) {
      activeCampaign.value = res.data.active;
    }
  } catch {
    campaigns.value = [];
  }
}

const canSend = computed(() => {
  if (rows.value.length === 0) return false;
  if (!mappingKeys.value.email || !mappingKeys.value["nama-kandidat"]) return false;
  if (!templateBody.value) return false;
  if (!campaignName.value.trim()) return false;
  if (activeCampaign.value?.status === "running") return false;
  return validRecipients.value.length > 0 && !isSending.value;
});

const previewEmail = computed(() => {
  const first = validRecipients.value[0];
  if (!first) {
    return { subject: "-", body: "-", html: "" };
  }
  const payload: Record<string, string> = {};
  for (const entry of mappingEntries.value) {
    payload[entry.placeholder] = first[entry.placeholder] || "";
  }
  const merged = { ...payload, ...effectiveFieldValues.value };
  const subjectText = applyPlaceholders(templateSubject.value || "Email Informasi", merged);
  const bodyText = applyPlaceholders(templateBody.value || "", merged);
  const html = isHtmlBody(bodyText)
    ? applyPalette(applyPlaceholders(templateBody.value || "", merged, true), effectivePaletteId.value)
    : "";
  return { subject: subjectText, body: bodyText, html };
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
      name: campaignName.value.trim(),
      templateId: selectedTemplateId.value || undefined,
      subject: templateSubject.value || undefined,
      body: templateBody.value,
      testEmail: testEmail.value || undefined,
      noreply: noreply.value,
      palette: effectivePaletteId.value || undefined,
      recipients: validRecipients.value.map((r) => ({ ...r, ...effectiveFieldValues.value })),
    };

    const res: any = await $fetch("/api/admin/email-blast", {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Blast dimulai",
      description: `Campaign "${res?.data?.name}" — ${res?.data?.total} penerima. Proses berjalan di background.`,
      color: "green",
    });

    await checkActiveCampaign();
    startPolling();
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

async function checkActiveCampaign() {
  try {
    const res: any = await $fetch("/api/admin/email-blast/progress");
    activeCampaign.value = res?.data || null;
  } catch {
    activeCampaign.value = null;
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(async () => {
    if (!activeCampaign.value?.campaignId) return;
    try {
      const res: any = await $fetch(`/api/admin/email-blast/progress?campaignId=${activeCampaign.value.campaignId}`);
      activeCampaign.value = res?.data || null;
      if (activeCampaign.value?.status === "done") {
        stopPolling();
        fetchCampaigns();
        toast.add({
          title: "Blast selesai",
          description: `Terkirim ${activeCampaign.value.sent}, gagal ${activeCampaign.value.failed}.`,
          color: "green",
        });
      } else if (activeCampaign.value?.status === "cancelled") {
        stopPolling();
        fetchCampaigns();
        toast.add({
          title: "Blast dibatalkan",
          description: `Terkirim ${activeCampaign.value.sent} dari ${activeCampaign.value.total}.`,
          color: "orange",
        });
      }
    } catch {
      stopPolling();
      activeCampaign.value = null;
    }
  }, 2000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function cancelBlast() {
  if (!activeCampaign.value?.campaignId) return;
  if (!window.confirm(`Batalkan blast "${activeCampaign.value.name}"? Email yang sudah terkirim tidak dapat ditarik.`)) return;
  try {
    await $fetch("/api/admin/email-blast/cancel", {
      method: "POST",
      body: { campaignId: activeCampaign.value.campaignId },
    });
    toast.add({ title: "Blast dibatalkan", color: "orange" });
    stopPolling();
    await checkActiveCampaign();
    await fetchCampaigns();
  } catch (error: any) {
    toast.add({
      title: "Gagal membatalkan",
      description: error?.data?.error?.message || "Coba lagi.",
      color: "red",
    });
  }
}

function dismissCampaign() {
  activeCampaign.value = null;
  campaignName.value = "";
  stopPolling();
  fetchCampaigns();
}

onMounted(() => {
  loadFromLocalStorage();
  fetchCampaigns();
  checkActiveCampaign().then(() => {
    if (activeCampaign.value?.status === "running") {
      startPolling();
    }
  });
});

onUnmounted(() => {
  stopPolling();
});

const logModalOpen = ref(false);
const logCampaign = ref<any>(null);
const logItems = ref<any[]>([]);
const logLoading = ref(false);
const logExportLoading = ref(false);
const logStatusFilter = ref("all");
const logSearch = ref("");
const logPage = ref(1);
const logPageSize = ref(20);
const logTotal = ref(0);
const logSentCount = ref(0);
const logFailedCount = ref(0);

const logStatusTabs = [
  { label: "Semua", value: "all" },
  { label: "Terkirim", value: "sent" },
  { label: "Gagal", value: "failed" },
];

const recipientFields = ref<string[]>([]);

function humanizeField(key: string) {
  return key
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const logColumns = computed(() => [
  { key: "recipientEmail", label: "Email" },
  { key: "recipientName", label: "Nama" },
  ...recipientFields.value
    .filter((f) => f !== "email" && f !== "nama" && f !== "nama-kandidat")
    .map((f) => ({ key: `recipientData.${f}`, label: humanizeField(f) })),
  { key: "status", label: "Status" },
  { key: "error", label: "Error" },
  { key: "waktu", label: "Waktu" },
]);

function openLogDetail(campaign: any) {
  logCampaign.value = campaign;
  logStatusFilter.value = "all";
  logSearch.value = "";
  logPage.value = 1;
  logModalOpen.value = true;
  fetchLogs();
}

function setLogFilter(status: string) {
  logStatusFilter.value = status;
  logPage.value = 1;
  fetchLogs();
}

async function fetchLogs() {
  if (!logCampaign.value?.campaignId) return;
  logLoading.value = true;
  try {
    const params: Record<string, any> = {
      campaignId: logCampaign.value.campaignId,
      page: logPage.value,
      pageSize: logPageSize.value,
    };
    if (logStatusFilter.value !== "all") {
      params.status = logStatusFilter.value;
    }
    if (logSearch.value.trim()) {
      params.q = logSearch.value.trim();
    }
    const res: any = await $fetch("/api/admin/email-blast/logs", { params });
    logItems.value = res?.data?.items || [];
    logTotal.value = res?.data?.total || 0;
    logSentCount.value = res?.data?.sentCount || 0;
    logFailedCount.value = res?.data?.failedCount || 0;
    recipientFields.value = res?.data?.recipientFields || [];
  } catch {
    logItems.value = [];
    logTotal.value = 0;
    recipientFields.value = [];
  } finally {
    logLoading.value = false;
  }
}

async function exportLogCSV() {
  if (!logCampaign.value?.campaignId) return;
  logExportLoading.value = true;
  try {
    const params: Record<string, any> = {
      campaignId: logCampaign.value.campaignId,
    };
    if (logStatusFilter.value !== "all") {
      params.status = logStatusFilter.value;
    }
    const res: any = await $fetch("/api/admin/email-blast/logs/export", { params });
    const csv = res?.data?.csv;
    const filename = res?.data?.filename || "email_logs.csv";

    if (csv) {
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.add({
        title: "Export berhasil",
        description: `${res?.data?.total || 0} data log diunduh sebagai CSV.`,
        color: "green",
      });
    }
  } catch {
    toast.add({
      title: "Export gagal",
      description: "Gagal mengekspor log email. Coba lagi.",
      color: "red",
    });
  } finally {
    logExportLoading.value = false;
  }
}

let logSearchTimer: ReturnType<typeof setTimeout> | null = null;
watch(logSearch, () => {
  if (logSearchTimer) clearTimeout(logSearchTimer);
  logSearchTimer = setTimeout(() => {
    logPage.value = 1;
    fetchLogs();
  }, 400);
});

watch(logPage, () => {
  if (logModalOpen.value) fetchLogs();
});
</script>
