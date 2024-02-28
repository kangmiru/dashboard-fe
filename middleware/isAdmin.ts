import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const useStore = useUserStore();
  const role = useStore.role
  if (role !== "admin") {
    return navigateTo("/");
  }
});
