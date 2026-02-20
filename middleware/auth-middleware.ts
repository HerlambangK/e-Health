import { canAccessRoute, normalizeRole, type Role } from "~/utils/permissions";

export default defineNuxtRouteMiddleware((to) => {
  const { data, status } = useAuth();

  if (status.value === "unauthenticated") {
    return navigateTo("/auth/signin");
  }

  if (status.value !== "authenticated") return;

  const role = normalizeRole(data.value?.user?.role);
  const isActive = data.value?.user?.isActive !== false;

  if (!isActive) {
    return navigateTo("/auth/signin");
  }

  if (!canAccessRoute(role, to.path)) {
    const fallbackByRole: Record<Role, string> = {
      admin: "/admin",
      doctor: "/doctor",
      nurse: "/patient-record",
      receptionist: "/patient-record",
      billing: "/patient-record/billing",
      patient: "/dashboard",
    };

    return navigateTo(fallbackByRole[role]);
  }
});
