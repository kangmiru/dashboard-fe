import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const useStore = useUserStore();
  const role = useStore.role;
  if (
    role !== "penanggung_jawab_sekolah" &&
    role !== "penanggung_jawab_yayasan" &&
    role !== "admin"
  ) {
    navigateTo("/");
  }
});
