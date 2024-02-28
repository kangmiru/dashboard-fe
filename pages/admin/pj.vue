<script setup lang="ts">
import {
  PhNotePencil,
  PhLinkSimpleHorizontal,
  PhPlusCircle,
  PhSpinner,
  PhTrash,
  PhX,
} from "@phosphor-icons/vue";
import type { FormError } from "#ui/types";
import { getAllSekolah } from "@/services/sekolah";
import { getAllYayasan } from "@/services/yayasan";
import {
  getAllPenanggungJawab,
  addPenanggungJawab,
  updatePenanggungJawab,
} from "@/services/penanggungJawab";
import { deleteUser } from "@/services/user";

definePageMeta({
  layout: "admin",
  middleware: ['auth', 'is-admin'],
});
useHead({
  title: "Penanggung Jawab",
});

const isLoading = ref(true);
const dataPenanggungJawab = ref([]);
const data = ref([]);
const dataYayasan = ref([]);
const dataSekolah = ref([]);
const selected = ref([]);
const page = ref(1);
const pageCount = 5;
const currRow = ref();

const isModalAddOpen = ref(false);
const isModalLinkOpen = ref(false);
const isModalEditOpen = ref(false);
const isModalDeleteOpen = ref(false);

interface State {
  id: number;
  name: string;
  institution_type: string;
  institution_name: string;
  institution_id: number;
  phone_number: string;
  email: string;
  password: string;
}

const state = reactive<State>({
  id: 0,
  name: "",
  institution_type: "",
  institution_name: "",
  institution_id: 0,
  email: "",
  password: "",
  phone_number: "",
});

const jenisInstansi = [
  {
    name: "Yayasan",
    value: "Yayasan",
  },
  {
    name: "Sekolah",
    value: "Sekolah",
  },
];

const columns = [
  {
    key: "user.name",
    label: "Nama",
  },
  {
    key: "institution.type.name",
    label: "Instansi",
  },
  {
    key: "user.email",
    label: "Email",
  },
  {
    key: "user.phone_number",
    label: "No. Telp",
  },
  {
    key: "link",
    label: "Link",
  },
  {
    key: "aksi",
    label: "Aksi",
  },
];

function select(row: any) {
  const index = selected.value.findIndex((item: any) => item.id === row.id);
  if (index === -1) {
    selected.value.push(row as never);
  } else {
    selected.value.splice(index, 1);
  }
}

const showModalLink = (row: any) => {
  currRow.value = row;
  isModalLinkOpen.value = true;
};

const showModalAdd = () => {
  state.name = "";
  state.institution_type = "";
  state.institution_name = "";
  state.email = "";
  state.password = "";
  state.phone_number = "";
  isModalAddOpen.value = true;
};

const showModalEdit = (row: any) => {
  currRow.value = row;
  state.id = row.user.id;
  state.name = row.user.name;
  state.institution_type = row.institution.type.name;
  state.institution_name = row.institution.name;
  state.institution_id = row.institution.id;
  state.email = row.user.email;
  state.password = row.password;
  state.phone_number = row.user.phone_number;
  isModalEditOpen.value = true;
};

const showModalDelete = (row: any) => {
  currRow.value = row;
  state.id = row.user.id;
  isModalDeleteOpen.value = true;
};

const validate = (state: any): FormError[] => {
  const errors = [];
  if (!state.name) errors.push({ path: "name", message: "Required" });
  if (!state.institution_type)
    errors.push({ path: "institution_type", message: "Required" });
  if (!state.institution_name)
    errors.push({ path: "institution_name", message: "Required" });
  if (!state.email) errors.push({ path: "email", message: "Required" });
  // if (!state.password) errors.push({ path: "password", message: "Required" });
  if (!state.phone_number)
    errors.push({ path: "phone_number", message: "Required" });
  return errors;
};

async function onSubmit() {
  // Do something with data
  const dataToSend = new FormData();
  dataToSend.append("name", String(state.name));
  dataToSend.append("email", String(state.email));
  dataToSend.append("phone_number", String(state.phone_number));
  dataToSend.append("institution", String(state.institution_id));
  if (state.password) {
    dataToSend.append("password", String(state.password));
  }
  if (isModalEditOpen.value) {
    await updatePenanggungJawab(state.id, dataToSend);
    isModalEditOpen.value = false;
  }
  if (isModalAddOpen.value) {
    await addPenanggungJawab(dataToSend);
    isModalAddOpen.value = false;
  }
  dataPenanggungJawab.value = await getAllPenanggungJawab();
}

async function onDelete() {
  try {
    await deleteUser(state.id);
  } catch (e) {
    console.log(e);
  }
  dataPenanggungJawab.value = await getAllPenanggungJawab();
  isModalDeleteOpen.value = false;
}

const rows = computed(() => {
  return dataPenanggungJawab.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount
  );
});

// Fetch table data Penanggung Jawab (Person In Charge)
onMounted(() => {
  nextTick(async () => {
    dataPenanggungJawab.value = await getAllPenanggungJawab();
    dataYayasan.value = (await getAllYayasan()).map((e: any) => {
      return { value: e.id, name: e.name };
    });
    dataSekolah.value = (await getAllSekolah()).map((e: any) => {
      return { value: e.id, name: e.name };
    });
    isLoading.value = false;
  });
});
</script>

<template>
  <div class="h-full bg-gray-100 px-6 py-8">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <PhSpinner :size="48" class="animate-spin" />
    </div>
    <template v-else>
      <div class="flex items-center justify-between font-semibold">
        <h1>Daftar Penanggung Jawab</h1>
        <button
          type="button"
          @click="showModalAdd"
          class="flex items-center bg-gradient-to-b from-sky-500 to-blue-900 hover:from-blue-600 hover:to-blue-900 rounded text-white px-3 py-2"
        >
          <PhPlusCircle :size="24" />
          <span class="ml-1">Tambah Data</span>
        </button>
      </div>
      <div class="bg-white shadow-xl rounded mt-6 p-5">
        <UTable
          v-model="selected"
          :rows="rows"
          :columns="columns"
          :ui="{
            thead: 'bg-gradient-to-b from-sky-500 to-blue-900',
            tbody: '',
            divide: '',
            th: {
              color: 'text-white',
              padding: 'p-3',
              font: 'font-semibold',
            },
            td: {
              color: 'text-gray-900',
              padding: 'p-3',
              font: 'font-medium',
            },
          }"
        >
          <template #link-data="{ row }">
            <div class="flex justify-center font-semibold">
              <button
                type="button"
                @click="showModalLink(row)"
                :class="
                  'text-' + (row.institution.name ? 'blue-500' : 'gray-400')
                "
              >
                <PhLinkSimpleHorizontal :size="18" />
              </button>
            </div>
          </template>
          <template #aksi-data="{ row }">
            <div class="flex items-center font-semibold">
              <button
                type="button"
                @click="showModalEdit(row)"
                class="text-green-500 mr-2"
              >
                <PhNotePencil :size="18" />
              </button>
              <button
                type="button"
                @click="showModalDelete(row)"
                class="text-red-500"
              >
                <PhTrash :size="18" />
              </button>
            </div>
          </template>
        </UTable>
        <div
          class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
        >
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="dataPenanggungJawab.length"
            :active-button="{
              color: 'blue',
            }"
          />
        </div>
      </div>
    </template>
  </div>
  <UModal
    v-model="isModalAddOpen"
    :ui="{ background: 'bg-gray-100', base: 'sm:!max-w-3xl' }"
  >
    <div
      class="text-white font-semibold flex items-center justify-between bg-gradient-to-b from-sky-500 to-blue-900 p-4"
    >
      <div>Tambah Data Penanggung Jawab</div>
      <button type="button" @click="isModalAddOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama" name="name" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup
              label="Instansi"
              name="institution_type"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.institution_type"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Instansi"
                :options="jenisInstansi"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Nama Instansi"
              name="institution"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.institution_id"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Nama Instansi"
                :options="
                  state.institution_type == jenisInstansi[0].value
                    ? dataYayasan
                    : dataSekolah
                "
                option-attribute="name"
              />
            </UFormGroup>
          </div>
          <div>
            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup label="Password" name="password" class="mb-3" required>
              <UInput v-model="state.password" />
            </UFormGroup>

            <UFormGroup
              label="No. Telp"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>
          </div>
        </div>

        <div class="flex items-center justify-end mt-32">
          <button
            type="button"
            @click="isModalAddOpen = false"
            class="px-3 py-2 text-blue-500 border-2 border-blue-500 rounded mr-2"
          >
            Batal
          </button>
          <UButton
            type="submit"
            class="p-3 text-white bg-gradient-to-b rounded from-sky-500 to-blue-900 hover:from-blue-600 hover:to-blue-900"
          >
            Simpan
          </UButton>
        </div>
      </UForm>
    </div>
  </UModal>
  <UModal v-model="isModalLinkOpen" :ui="{ background: 'bg-gray-100' }">
    <div
      class="text-white font-semibold flex items-center justify-between bg-gradient-to-b from-sky-500 to-blue-900 p-4"
    >
      <div>Perhatian!</div>
      <button type="button" @click="isModalLinkOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium text-center p-6">
      <template v-if="currRow.institution.name">
        <div class="text-md mt-3">
          Penanggung Jawab Sudah Terhubung Dengan Instansi :
        </div>
        <div class="text-md text-gray-500 mb-3">
          {{ currRow.institution.name }}
        </div>
      </template>
      <template v-else>
        <div class="text-md text-gray-500 my-3">
          Penanggung Jawab Belum Terhubung Dengan Instansi
        </div>
      </template>
    </div>
  </UModal>
  <UModal
    v-model="isModalEditOpen"
    :ui="{ background: 'bg-gray-100', base: 'sm:!max-w-3xl' }"
  >
    <div
      class="text-white font-semibold flex items-center justify-between bg-gradient-to-b from-sky-500 to-blue-900 p-4"
    >
      <div>Edit Data Penanggung Jawab</div>
      <button type="button" @click="isModalEditOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama" name="name" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup
              label="Instansi"
              name="institution_type"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.institution_type"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Instansi"
                :options="jenisInstansi"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Nama Instansi"
              name="institution_name"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.institution_id"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Nama Instansi"
                :options="
                  state.institution_type == jenisInstansi[0].value
                    ? dataYayasan
                    : dataSekolah
                "
                option-attribute="name"
              />
            </UFormGroup>
          </div>
          <div>
            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup label="Password" name="password" class="mb-3" required>
              <UInput v-model="state.password" />
            </UFormGroup>

            <UFormGroup
              label="No. Telp"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>
          </div>
        </div>

        <div class="flex items-center justify-end mt-32">
          <button
            type="button"
            @click="isModalEditOpen = false"
            class="px-3 py-2 text-blue-500 border-2 border-blue-500 rounded mr-2"
          >
            Batal
          </button>
          <UButton
            type="submit"
            class="p-3 text-white bg-gradient-to-b rounded from-sky-500 to-blue-900 hover:from-blue-600 hover:to-blue-900"
          >
            Simpan
          </UButton>
        </div>
      </UForm>
    </div>
  </UModal>
  <UModal
    v-model="isModalDeleteOpen"
    :ui="{
      background: 'bg-gray-100',
      width: 'sm:max-w-xs',
    }"
  >
    <div class="flex flex-col p-4">
      <div class="text-center text-lg font-medium">
        Apakah anda yakin ingin menghapus data ini?
      </div>
      <div class="flex items-center justify-center mt-3">
        <button
          type="button"
          @click="isModalDeleteOpen = false"
          class="px-3 py-1 text-blue-500 border-2 border-blue-500 rounded mr-2"
        >
          Batal
        </button>
        <button
          type="button"
          @click="onDelete"
          class="px-7 py-1.5 font-medium text-white bg-gradient-to-b rounded from-sky-500 to-blue-900 hover:from-blue-600 hover:to-blue-900"
        >
          Ya
        </button>
      </div>
    </div>
  </UModal>
</template>
