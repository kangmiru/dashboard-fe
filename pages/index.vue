<script lang="ts" setup>
import { PhSignIn, PhEye } from "@phosphor-icons/vue";
import type { FormError } from "@nuxt/ui/dist/runtime/types";
import { login, getUserInfo } from "@/services/auth";
import { getInstansiPenanggungJawab } from "@/services/penanggungJawab";
import { useUserStore } from "@/stores/user";
import { toTitleCase } from "@/utils/format";

const userStore = useUserStore();

let passType = ref("password");

useHead({
  title: "Sign in",
});

interface User {
  email: string;
  password: string;
}

const state = reactive<User>({
  email: "",
  password: "",
});

const togglePass = () => {
  if (passType.value == "password") {
    passType.value = "text";
  } else {
    passType.value = "password";
  }
};

const validate = (state: User): FormError[] => {
  const errors = [];
  if (!state.email) errors.push({ path: "email", message: "Required" });
  if (!state.password) errors.push({ path: "password", message: "Required" });
  return errors;
};

const onSubmit = async () => {
  const formData = new FormData();
  formData.append("email", String(state.email));
  formData.append("password", String(state.password));
  try {
    await login(formData);

    const user = await getUserInfo();
    const role = user.role;
    userStore.loginUser(user.name, user.role);

    if (role == "admin") {
      await navigateTo("/admin");
    } else {
      const instansi = await getInstansiPenanggungJawab();
      const id_instansi = instansi.id;
      switch (role) {
        case "penanggung_jawab_yayasan":
          await navigateTo(`/yayasan/${id_instansi}`);
          break;

        case "penanggung_jawab_sekolah": {
          await navigateTo(`/sekolah/${id_instansi}`);
          break;
        }
        default:
          break;
      }
    }
  } catch (e) {
    console.log(e);
  }
};
</script>

<template>
  <div class="grid grid-cols-2 bg-gray-100 h-screen">
    <div
      class="bg-gradient-to-b from-blue-500 to-sky-900 rounded-r-3xl text-white p-8 flex flex-col justify-between"
    >
      <div class="flex items-center">
        <img
          src="~/assets/img/logo.png"
          alt="Logo"
          class="h-14 drop-shadow-lg"
        />
        <span class="ml-2 text-xl font-semibold"
          >PT Kunci Transformasi Digital</span
        >
      </div>
      <div>
        <span class="text font-semibold">Dashboard Kunci</span>
        <p class="text-sm">
          Dashboard Kunci yaitu platform website yang dirancang untuk membantu
          mereka dalam memonitoring berbagai aspek pendidikan dengan lebih
          mudah.
        </p>
      </div>
    </div>
    <div class="flex justify-center items-center">
      <div class="w-96">
        <PhSignIn :size="24" />
        <h1 class="text-2xl font-semibold">Sign in</h1>
        <span class="font-medium">Please enter your account.</span>
        <UForm
          class="mt-8"
          :state="state"
          :validate="validate"
          @submit="onSubmit"
        >
          <div class="flex flex-col">
            <UFormGroup label="Email" name="email">
              <UInput
                v-model="state.email"
                type="text"
                name="email"
                id="email"
                class="rounded-lg border-2 border-gray-300 w-96"
                placeholder="example@example.com"
              />
            </UFormGroup>
          </div>
          <div class="flex flex-col mt-2">
            <UFormGroup label="Password" name="email">
              <div class="relative">
                <PhEye
                  :size="20"
                  @click="togglePass"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-800 cursor-pointer z-10"
                />
                <UInput
                  v-model="state.password"
                  :type="passType"
                  name="password"
                  id="password"
                  class="rounded-lg border-2 border-gray-300 w-96"
                  placeholder="*****"
                />
              </div>
            </UFormGroup>
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-sky-500 hover:from-blue-700 to-sky-700 hover:to-sky-950 rounded-lg text-white mt-4 h-10 font-semibold"
          >
            Sign in
          </button>
        </UForm>
        <p class="mt-4 text-xs">
          <span class="text-red-500">*</span>Jika ingin mendaftar sebagai
          penanggung jawab instansi silahkan hubungi admin.
        </p>
      </div>
    </div>
  </div>
</template>
