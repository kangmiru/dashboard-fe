// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: process.env.DEV_PORT ? parseInt(process.env.DEV_PORT, 10) : undefined,
  },
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Poppins: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
      },
    ],
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],
  runtimeConfig: {
    public: {
      baseApiUrl: process.env.BASE_API_URL,
      apiUrl: "/api",
    },
  },
  colorMode: {
    preference: "light",
  },
});
