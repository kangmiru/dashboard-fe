<template>
  <div class="flex h-full w-full">
    <AdminSidebar />
    <div class="w-full min-h-screen bg-gray-100">
      <AdminHeader />
      <slot />
    </div>
  </div>
</template>