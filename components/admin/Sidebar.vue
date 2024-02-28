<script lang="ts" setup>
import { logout } from "~/services/auth";
import { PhHouseSimple, PhListBullets, PhSignOut } from "@phosphor-icons/vue";
const onLogout = async () => {
  await logout();
  navigateTo("/");
};
</script>

<template>
  <div class="bg-white w-72">
    <div class="flex flex-col justify-between h-full">
      <div>
        <div class="h-20 flex items-center justify-center">
          <img src="~/assets/img/logo.png" alt="Logo" class="h-12" />
          <div class="ml-1 font-semibold text-lg">PT Kunci</div>
        </div>
        <NuxtLink
          :to="{ name: 'admin' }"
          active-class="!text-white bg-gradient-to-r from-blue-950 to-slate-950"
          :class="{
            'hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-700 hover:text-white':
              $route.name != 'admin',
          }"
          class="flex items-center pl-6 h-14 text-sm font-semibold text-gray-500"
        >
          <PhHouseSimple :size="18" weight="bold" />
          <span class="ml-1">Dashboard</span>
        </NuxtLink>
        <NuxtLink
          :to="{ name: 'admin-yayasan' }"
          active-class="!text-white bg-gradient-to-r from-blue-950 to-slate-950"
          :class="{
            'hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-700 hover:text-white':
              $route.name != 'admin-yayasan',
          }"
          class="flex items-center pl-6 h-14 text-sm font-semibold text-gray-500"
        >
          <PhListBullets :size="18" weight="bold" />
          <span class="ml-1">Yayasan</span>
        </NuxtLink>
        <NuxtLink
          :to="{ name: 'admin-sekolah' }"
          active-class="!text-white bg-gradient-to-r from-blue-950 to-slate-950"
          :class="{
            'hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-700 hover:text-white':
              $route.name != 'admin-sekolah',
          }"
          class="flex items-center pl-6 h-14 text-sm font-semibold text-gray-500"
        >
          <PhListBullets :size="18" weight="bold" />
          <span class="ml-1">Sekolah</span>
        </NuxtLink>
        <NuxtLink
          :to="{ name: 'admin-pj' }"
          active-class="!text-white bg-gradient-to-r from-blue-950 to-slate-950"
          :class="{
            'hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-700 hover:text-white':
              $route.name != 'admin-pj',
          }"
          class="flex items-center pl-6 h-14 text-sm font-semibold text-gray-500"
        >
          <PhListBullets :size="18" weight="bold" />
          <span class="ml-1">Penanggung Jawab</span>
        </NuxtLink>
      </div>
      <div>
        <button
          type="button"
          class="flex items-center pl-6 h-14 text-sm font-semibold text-gray-500 w-full hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-700 hover:text-white"
          @click="onLogout"
        >
          <PhSignOut :size="18" weight="bold" class="rotate-180" />
          <span class="ml-1">Sign out</span>
        </button>
      </div>
    </div>
  </div>
</template>
