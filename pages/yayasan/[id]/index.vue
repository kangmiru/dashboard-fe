<script lang="ts" setup>
import { PhPaperPlaneTilt, PhSpinner } from "@phosphor-icons/vue";
import { useRoute } from "vue-router";
import { getYayasan, getSummarySekolah } from "@/services/yayasan";
useHead({
  title: "Dashboard Penanggung Jawab Yayasan",
});

definePageMeta({
  middleware: ["auth", "is-penanggung-jawab-yayasan-or-admin"],
});

const route = useRoute();

const isLoading = ref(true);
const data = ref();
const dataSekolah = ref();

// Ensure that route.params.id is treated as a string
const idParam = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;
// Now you can safely use parseInt, as idParam is guaranteed to be a string
const yayasanId = parseInt(idParam, 10);

onMounted(() => {
  nextTick(async () => {
    data.value = await getYayasan(yayasanId);
    dataSekolah.value = await getSummarySekolah(yayasanId);
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
          <h1 class="font-semibold text-white/75">Dashboard</h1>
          <div class="mt-4 flex gap-4 leading-6">
            <div
              class="p-4 flex-none w-48 rounded-lg flex flex-col items-center justify-center bg-white"
            >
              <img :src="data.image" alt="Logo" class="img-fill-container" />
              <div class="text-xl font-semibold">{{ data.nama }}</div>
            </div>
            <div
              class="px-6 py-8 flex-auto w-96 rounded-lg flex flex-col bg-white shadow-lg"
            >
              <div class="text-2xl font-semibold">Informasi Yayasan</div>
              <table class="w-100 mt-2">
                <tbody>
                  <tr>
                    <td class="font-medium w-48">Nama Yayasan</td>
                    <td class="font-medium">:</td>
                    <td>{{ data.name }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium w-48">Alamat Yayasan</td>
                    <td class="font-medium">:</td>
                    <td>{{ data.address.complete_address }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium w-48">No. Telepon Yayasan</td>
                    <td class="font-medium">:</td>
                    <td>{{ data.phone_number }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium w-48">Email Yayasan</td>
                    <td class="font-medium">:</td>
                    <td>{{ data.email }}</td>
                  </tr>
                  <tr>
                    <td class="font-medium w-48">Kepala Yayasan</td>
                    <td class="font-medium">:</td>
                    <td>{{ data.head_person }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="px-6 py-8 flex-auto w-32 rounded-lg bg-white shadow-lg">
              <div class="flex justify-between">
                <div>
                  <div class="text-xl font-semibold">Maps Lokasi</div>
                  <div class="text-xs text-gray-500">{{ data.alamat }}</div>
                </div>
                <PhPaperPlaneTilt weight="fill" />
              </div>
              <iframe
                :src="`https://maps.google.com/maps?q=${data.address.complete_address}&t=&z=13&ie=UTF8&iwloc=&output=embed`"
                class="rounded-lg w-full mt-2"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
              ></iframe>
            </div>
          </div>
          <div class="flex flex-wrap justify-center w-full mt-8">
            <template v-for="(e, i) in dataSekolah" :key="i">
              <div
                class="w-1/4 pb-6"
                :class="(i + 1) % 4 != 0 ? 'pr-6' : 'pr-0'"
              >
                <NuxtLink
                  :to="`/yayasan/${yayasanId}/sekolah/${e.id}`"
                  class="flex flex-col items-center justify-between bg-white hover:bg-gray-100 rounded-lg shadow-lg w-full px-10 py-8 text-center h-full"
                >
                  <div class="flex flex-col items-center">
                    <div
                      class="flex items-center justify-center mb-6 bg-gradient-to-b from-sky-500 to-sky-200 rounded-circle h-28 w-28 rounded-full"
                    >
                      <UIcon
                        name="i-heroicons-academic-cap-20-solid"
                        class="h-10 w-10 text-white"
                      />
                    </div>
                    <div class="text-xl font-semibold mb-12">{{ e.name }}</div>
                  </div>
                  <div>
                    <div class="text-gray-400">Total Sekolah :</div>
                    <div class="text-2xl font-semibold">
                      {{ e.count }} Sekolah
                    </div>
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
