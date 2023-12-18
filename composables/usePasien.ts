import { ref } from "vue";
import {
  getAllPasien,
  getPasienById,
  createPasien,
  updatePasien,
  deletePasien,
} from "~/services/pasienService";

const pasienList = ref([]);
const selectedPasien = ref(null);

export function usePasien() {
  async function fetchPasienList() {
    pasienList.value = await getAllPasien();
  }

  async function fetchPasienById(id) {
    selectedPasien.value = await getPasienById(id);
  }

  async function addPasien(pasienData) {
    await createPasien(pasienData);
    fetchPasienList();
  }

  async function editPasien(id, pasienData) {
    await updatePasien(id, pasienData);
    fetchPasienList();
  }

  async function removePasien(id) {
    await deletePasien(id);
    fetchPasienList();
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
