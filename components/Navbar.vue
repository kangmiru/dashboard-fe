<script lang="ts" setup>
import { logout } from "@/services/auth";
import { getInstansiPenanggungJawab } from "@/services/penanggungJawab";
import { useUserStore } from "@/stores/user";
import { toTitleCase } from "@/utils/format";

const userStore = useUserStore();
const name = userStore.name;
const role = userStore.role;

const instansi = ref();

const onLogout = async () => {
  await logout();
  navigateTo("/");
};

const items = [
  [
    {
      label: "Sign Out",
      icon: "i-heroicons-arrow-left-on-rectangle-20-solid",
      click: onLogout,
    },
  ],
];

onMounted(() => {
  nextTick(async () => {
    if (role !== "admin") {
      instansi.value = await getInstansiPenanggungJawab();
    }
  });
});
</script>

<template>
  <nav
    class="flex items-center justify-between bg-white sticky top-0 z-20 px-10 py-4"
  >
    <div class="flex items-center">
      <div v-if="role !== 'admin'">
        <h1 class="text-xl font-semibold">{{ instansi?.name }}</h1>
        <div class="text-sm text-gray-500">
          {{ instansi?.address }}
        </div>
      </div>
    </div>
    <div class="font-semibold">
      <div>Dashboard</div>
      <div class="text-3xl text-center -mt-4">&bull;</div>
    </div>
    <div class="text-sm">
      <UDropdown :items="items" class="w-full">
        <UButton
          color="white"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          variant="link"
          class="flex items-center justify-between px-0 w-full"
        >
          {{ name }}
        </UButton>
      </UDropdown>
      <div class="text-gray-500">{{ toTitleCase(role) }}</div>
    </div>
  </nav>
</template>
