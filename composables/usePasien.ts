import type { AsyncData } from "#app";

const pasienList = ref<any[]>([]);
const selectedPasien = ref<any>(null);

export function usePasien() {
  async function fetchPasienList(params?: Record<string, any>) {
    const res = await $fetch<{ data: any[] }>("/api/pasien", { params });
    pasienList.value = res.data || [];
  }

  async function fetchPasienById(id: string) {
    const res = await $fetch<{ data: any }>(`/api/pasien/${id}`);
    selectedPasien.value = res.data;
  }

  async function addPasien(pasienData: any) {
    await $fetch("/api/pasien", { method: "POST", body: pasienData });
    await fetchPasienList();
  }

  async function editPasien(id: string, pasienData: any) {
    await $fetch(`/api/pasien/${id}`, { method: "PUT", body: pasienData });
    await fetchPasienList();
  }

  async function removePasien(id: string) {
    await $fetch(`/api/pasien/${id}`, { method: "DELETE" });
    await fetchPasienList();
  }

  return {
    pasienList,
    selectedPasien,
    fetchPasienList,
    fetchPasienById,
    addPasien,
    editPasien,
    removePasien,
  };
}
