export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useAuth();
  console.log("status", status);

  if (status.value === "authenticated") {
    console.log("status", status.value);

    // return navigateTo("admin");
    return navigateTo({
      name: "dashboard",
    });
  } else if (status.value === "unauthenticated") {
    console.log("status", status.value);

    return navigateTo({
      name: "index",
    });
  }
});
