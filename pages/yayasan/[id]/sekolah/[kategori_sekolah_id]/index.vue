<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { PhSpinner } from "@phosphor-icons/vue";
import { getYayasanSekolahCategory, getYayasan } from "@/services/yayasan";
import { getKategoriById } from "@/services/sekolah";
const route = useRoute();
const config = useRuntimeConfig();

useHead({
  title: "Dashboard Penanggung Jawab Yayasan",
});

definePageMeta({
  middleware: ["auth", 'is-penanggung-jawab-yayasan-or-admin'],
});

const isLoading = ref(true);
const data = ref();
const dataYayasan = ref()
const kategoriSekolah = ref();

// Ensure that route.params.id is treated as a string
const idParam = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;
// Now you can safely use parseInt, as idParam is guaranteed to be a string
const yayasanId = parseInt(idParam, 10);

// Ensure that route.params.id is treated as a string
const kategoriSekolahIdParam = Array.isArray(route.params.kategori_sekolah_id)
  ? route.params.kategori_sekolah_id[0]
  : route.params.kategori_sekolah_id;
// Now you can safely use parseInt, as idParam is guaranteed to be a string
const kategoriSekolahId = parseInt(kategoriSekolahIdParam, 10);

onMounted(() => {
  nextTick(async () => {
    data.value = await getYayasanSekolahCategory(yayasanId, kategoriSekolahId);
    kategoriSekolah.value = await getKategoriById(kategoriSekolahId);
    isLoading.value = false;
  });
});
</script>

<template>
  <div class="bg-gray-200">
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <PhSpinner :size="48" class="animate-spin" />
    </div>
    <template v-else>
      <Navbar />
      <div class="relative">
        <div
          class="absolute top-0 inset-x-0 h-[78vh] bg-gradient-to-r from-sky-500 to-blue-900"
        ></div>
        <div class="relative z-10 py-24 px-12">
          <div class="flex font-semibold">
            <NuxtLink to="/pj" class="text-white">Dashboard</NuxtLink>
            <div class="text-white mx-2">/</div>
            <h1 class="text-white/75">{{ kategoriSekolah.name }}</h1>
          </div>
          <div class="flex flex-wrap w-full mt-16">
            <template v-for="(e, i) in data" :key="i">
              <div
                class="w-1/5 pb-6"
                :class="(i + 1) % 4 != 0 ? 'pr-6' : 'pr-0'"
              >
                <NuxtLink
                  :to="`/sekolah/${e.id}`"
                  class="flex flex-col justify-between bg-white hover:bg-gray-100 rounded-lg shadow-lg w-full p-4 text-center h-full"
                >
                  <img :style="{height: '300px'}" :src="e.image" alt="Logo" />
                  <div class="text-left ml-4">
                    <div class="text-gray-400 my-4">{{ e.category.name }}</div>
                    <div class="text-xl font-semibold mb-4">{{ e.name }}</div>
                  </div>
                </NuxtLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
