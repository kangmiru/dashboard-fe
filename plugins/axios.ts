import http from "~/services/http";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  // Now that Nuxt is initialized and runtime config is available,
  http.defaults.baseURL = config.public.baseApiUrl;
  // update the Axios instance configuration as needed
  // Add more configuration as needed

  if (process.client) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      http.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
  }
});
