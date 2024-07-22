// middleware/authMiddleware.js
import { accountNavigationLinks } from "@/utils/index";

export default defineNuxtRouteMiddleware(async (to, from) => {
  let filteredNavigationLinks = accountNavigationLinks.slice(); // Salin menu awal

  const isAdmin = true; // Ganti dengan logika untuk memeriksa apakah pengguna adalah admin

  if (!isAdmin) {
    // Filter menu untuk pengguna non-admin
    filteredNavigationLinks = filteredNavigationLinks.filter(
      (link) => !link.isAdmin
    );
  }

  // Simpan menu yang sudah difilter di state Vuex atau gunakan secara langsung
  // Misalnya, menyimpannya di dalam state Vuex jika menggunakan state management
});
