<template>
  <div class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11">
    <div class="flex gap-2 px-3 py-3.5">
      <UInput type="file" @change="handleFileUpload" />
      <UButton @click="exportToExcel" :disabled="!results.length">Download Excel</UButton>
      <UButton @click="saveToDatabase" :disabled="!results.length">Save to Database</UButton>

      <UButton @click="checkWebsites">Check Websites</UButton>
    </div>

    <div v-if="results.length">
      <h3>Website Status</h3>
      <UTable :ui="{ td: { base: 'max-w-[0] truncate' } }" :rows="results" :columns="columns" :loading="loading"
        :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }">

      </UTable>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import axios from 'axios'

const file = ref(null)
const websites = ref([])
const results = ref([])

const columns = [
  { key: 'no', label: 'ID' },
  { key: 'website', label: 'Website' },
  { key: 'status', label: 'Status' },
]
const handleFileUpload = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      console.log("object", firstSheetName)
      const worksheet = workbook.Sheets[firstSheetName]
      console.log("worksheet", worksheet)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      console.log("jsonData", jsonData)
      websites.value = jsonData.slice(1).map(row => row[1])
    }
    reader.readAsArrayBuffer(selectedFile)
  }
}

const checkWebsites = async () => {
  // loading.value = true
  results.value = []
  for (let i = 0; i < websites.value.length; i++) {
    const website = websites.value[i]
    try {
      await axios.get(website)
      results.value.push({ no: i + 1, website, status: 'Active' })
    } catch (error) {
      results.value.push({ no: i + 1, website, status: 'Inactive' })
    }
  }
  loading.value = false
}



const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(results.value)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results')
  XLSX.writeFile(workbook, 'WebsiteStatus.xlsx')
}

const saveToDatabase = async () => {
  try {
    await axios.post('/api/save-website-status', { data: results.value })
    alert('Data saved to database successfully')
  } catch (error) {
    alert('Failed to save data to database')
  }
}

</script>
