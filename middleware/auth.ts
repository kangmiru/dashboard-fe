import { verifyToken } from "@/services/auth";
import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
  const useStore = useUserStore();
  if (useStore.isAuthenticated) {
    if (process.client) {
      const refreshToken = localStorage.getItem("refreshToken");
      verifyToken(refreshToken)
        .then((response: any) => {
          console.log(response.status);
        })
        .catch((error: any) => {
          if (error.response) {
            navigateTo("/");
          }
          if (error.request) {
            console.log(error.request);
          } else {
            console.log("Error", error.message);
          }
        });
    }
  }
});
