<script lang="ts" setup>
import { toTitleCase } from "@/utils/format";
const userStore = useUserStore();
const name = userStore.name;
const role = userStore.role;
</script>

<template>
  <div class="bg-white h-20 w-full px-4">
    <div v-if="role == 'admin'" class="flex items-center justify-between font-semibold text-sm h-full">
      <div>
        Selamat Datang, {{ name }}
      </div>
      <div class="border-l-2 border-gray-200 pl-3">
        <p>{{ name }}</p>
        <p class="text-xs text-gray-500">{{ toTitleCase(role) }}</p>
      </div>
    </div>
    <div v-else class="flex items-center justify-end font-semibold text-sm h-full">
      <div>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          size="sm"
          color="gray"
          :trailing="false"
          placeholder="Search..."
        />
      </div>
      <div class="ml-4 border-l-2 border-gray-200 pl-3">
        <p>{{ name }}</p>
        <p class="text-xs text-gray-500">{{ toTitleCase(role) }}</p>
      </div>
    </div>
  </div>
</template>