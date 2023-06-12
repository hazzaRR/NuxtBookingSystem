// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    telemetry: false,
    runtimeConfig: {
      public: {
        API_BASE_URL: process.env.API_BASE_URL //'http://localhost:5000'
      }
    },
    modules: [
        '@nuxtjs/tailwindcss'
      ]
})
