<script setup lang="ts">
import {
  PhNotePencil,
  PhPlus,
  PhPlusCircle,
  PhSpinner,
  PhTrash,
  PhX,
} from "@phosphor-icons/vue";
import type { FormError } from "#ui/types";
// API Services
import {
  getAllYayasan,
  addYayasan,
  updateYayasan,
  deleteYayasan,
  linkToSekolah,
} from "@/services/yayasan";
import {
  getProvinsi,
  getKabupaten,
  getKecamatan,
  getKelurahan,
} from "@/services/location";
import { getAllUnlinkedSekolah } from "@/services/sekolah";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "is-admin"],
});
useHead({
  title: "Yayasan",
});

// Data
const data = ref([]);
const dataSekolah = ref([]);
const dataProvinsi = ref([]);
const dataKabupaten = ref([]);
const dataKecamatan = ref([]);
const dataKelurahan = ref([]);
// Dynamic table
const selected = ref([]);
const page = ref(1);
const pageCount = 5;
const currRow = ref();
const isLoading = ref(true);
// Modals
const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);
const isModalLinkOpen = ref(false);
const isModalDeleteOpen = ref(false);
// Selected
const selectedNPSN = ref("");

interface Location {
  name: string;
  id: number;
}

interface State {
  id: number;
  name: string;
  address_detail: string;
  province: number;
  city_regency: number;
  district: number;
  sub_district: number;
  phone_number: string;
  email: string;
  head_person: string;
  image: File | null;
}

const state = reactive<State>({
  id: 0,
  name: "",
  address_detail: "",
  province: 0,
  city_regency: 0,
  district: 0,
  sub_district: 0,
  phone_number: "",
  email: "",
  head_person: "",
  image: null as File | null,
});

const columns = [
  {
    key: "name",
    label: "Nama",
  },
  {
    key: "address.complete_address",
    label: "Alamat",
  },
  {
    key: "phone_number",
    label: "No. Telp",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "head_person",
    label: "Kepala Yayasan",
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

const showModalAdd = () => {
  state.name = "";
  state.address_detail = "";
  state.province = 0;
  state.city_regency = 0;
  state.district = 0;
  state.sub_district = 0;
  state.phone_number = "";
  state.email = "";
  state.head_person = "";
  state.image = null;
  isModalAddOpen.value = true;
};

const showModalLink = (row: any) => {
  currRow.value = row;
  state.id = row.id;
  isModalLinkOpen.value = true;
};

const showModalEdit = (row: any) => {
  currRow.value = row;
  state.id = row.id;
  state.name = row.name;
  state.address_detail = row.address.detail;
  state.province = row.address.province.id;
  state.city_regency = row.address.city_regency.id;
  state.district = row.address.district.id;
  state.sub_district = row.address.sub_district.id;
  state.phone_number = row.phone_number;
  state.email = row.email;
  state.head_person = row.head_person;

  fetchKabupaten();
  fetchKecamatan();
  fetchKelurahan();
  isModalEditOpen.value = true;
};

const showModalDelete = (row: any) => {
  currRow.value = row;
  state.id = row.id;
  isModalDeleteOpen.value = true;
};

const validate = (state: any): FormError[] => {
  const errors = [];
  if (!state.name) errors.push({ path: "name", message: "Required" });
  if (!state.address_detail)
    errors.push({ path: "address_detail", message: "Required" });
  if (!state.province) errors.push({ path: "province", message: "Required" });
  if (!state.city_regency)
    errors.push({ path: "city_regency", message: "Required" });
  if (!state.district) errors.push({ path: "district", message: "Required" });
  if (!state.sub_district)
    errors.push({ path: "sub_district", message: "Required" });
  if (!state.phone_number)
    errors.push({ path: "phone_number", message: "Required" });
  if (!state.email) errors.push({ path: "email", message: "Required" });
  if (!state.head_person)
    errors.push({ path: "head_person", message: "Required" });
  return errors;
};

function handleFileUpload(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    state.image = target.files[0];
  } else {
    state.image = null;
  }
}

async function linkYayasan() {
  try {
    await linkToSekolah(state.id, selectedNPSN.value);
  } catch (e) {
    console.log(e);
  }
  dataSekolah.value = await getAllUnlinkedSekolah();
  isModalLinkOpen.value = false;
}

async function onSubmit() {
  // Prepare Form Data
  const dataToSend = new FormData();
  dataToSend.append("name", String(state.name));
  dataToSend.append("address_detail", String(state.address_detail));
  dataToSend.append("sub_district", String(state.sub_district));
  dataToSend.append("phone_number", String(state.phone_number));
  dataToSend.append("email", String(state.email));
  dataToSend.append("head_person", String(state.head_person));
  if (state.image) {
    dataToSend.append("image", state.image);
  }
  if (isModalAddOpen.value) {
    try {
      await addYayasan(dataToSend);
    } catch (e) {
      console.log(e);
    }
    isModalAddOpen.value = false;
  }
  if (isModalEditOpen.value) {
    try {
      await updateYayasan(state.id, dataToSend);
    } catch (e) {
      console.log(e);
    }
    isModalEditOpen.value = false;
  }
  data.value = await getAllYayasan();
}

async function onDelete() {
  try {
    await deleteYayasan(state.id);
  } catch (e) {
    console.log(e);
  }
  data.value = await getAllYayasan();
  isModalDeleteOpen.value = false;
}

const rows = computed(() => {
  return data.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

// Fetch table data Yayasan
onMounted(() => {
  nextTick(async () => {
    data.value = await getAllYayasan();
    isLoading.value = false;
  });
});
// Fetch list sekolah
onMounted(() => {
  nextTick(async () => {
    dataSekolah.value = await getAllUnlinkedSekolah();
  });
});

// Fetch Data Provinsi
onMounted(() => {
  nextTick(async () => {
    dataProvinsi.value = await getProvinsi();
  });
});
// Fetch Data Kabupaten/Kota by ID Provinsi after selecting
const fetchKabupaten = async () => {
  dataKabupaten.value = await getKabupaten(state.province);
};
// Fetch Data Kecamatan by ID Kabupaten after selecting
const fetchKecamatan = async () => {
  dataKecamatan.value = await getKecamatan(state.city_regency);
};
// Fetch Data Kelurahan by ID Kecamatan after selecting
const fetchKelurahan = async () => {
  dataKelurahan.value = await getKelurahan(state.district);
};
</script>

<template>
  <div class="h-full bg-gray-100 px-6 py-8">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <PhSpinner :size="48" class="animate-spin" />
    </div>
    <template v-else>
      <div class="flex items-center justify-between font-semibold">
        <h1>Daftar Yayasan</h1>
        <button
          type="button"
          @click="showModalAdd"
          class="flex items-center bg-gradient-to-b from-sky-500 to-blue-900 hover:from-blue-700 hover:to-blue-900 rounded text-white px-3 py-2"
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
          <template #name-data="{ row }">
            <NuxtLink :to="`/yayasan/${row.id}`">
              <p class="text-primary">{{ row.name }}</p>
            </NuxtLink>
          </template>
          <template #link-data="{ row }">
            <div class="flex justify-center font-semibold">
              <button
                type="button"
                @click="showModalLink(row)"
                class="text-blue-500"
              >
                <PhPlus :size="24" />
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
            :total="data.length"
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
      <div>Tambah Data Yayasan</div>
      <button type="button" @click="isModalAddOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm
        :state="state"
        class="space-y-4"
        :validate="validate"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama Yayasan" name="name" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup
              label="Jalan/Nomor Bangungan"
              name="address_detail"
              class="mb-3"
              required
            >
              <UInput v-model="state.address_detail" />
            </UFormGroup>

            <UFormGroup
              label="Provinsi Instansi"
              name="province"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.province"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKabupaten"
                placeholder="Pilih Provinsi"
                :options="dataProvinsi"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Kabupaten/Kota Instansi"
              name="city_regency"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.city_regency"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKecamatan"
                placeholder="Pilih Kabupaten/Kota"
                :options="dataKabupaten"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Kecamatan Instansi"
              name="district"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.district"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKelurahan"
                placeholder="Pilih Kecamatan"
                :options="dataKecamatan"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Desa/Kelurahan Instansi"
              name="sub_district"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.sub_district"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Desa/Kelurahan"
                :options="dataKelurahan"
                option-attribute="name"
              />
            </UFormGroup>
          </div>
          <div>
            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup
              label="No. Telp Yayasan"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>

            <UFormGroup
              label="Nama Kepala Yayasan"
              name="kepala"
              class="mb-3"
              required
            >
              <UInput v-model="state.head_person" />
            </UFormGroup>
            <UFormGroup label="Logo Yayasan" name="image" class="mb-3" required>
              <input
                type="file"
                variant="none"
                @change="handleFileUpload"
                class="flex items-center border-2 border-gray-300 border-dashed rounded bg-white shadow-sm h-[11em]"
              />
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
  <UModal
    v-model="isModalEditOpen"
    :ui="{ background: 'bg-gray-100', base: 'sm:!max-w-3xl' }"
  >
    <div
      class="text-white font-semibold flex items-center justify-between bg-gradient-to-b from-sky-500 to-blue-900 p-4"
    >
      <div>Edit Data Yayasan</div>
      <button type="button" @click="isModalEditOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm
        :state="state"
        class="space-y-4"
        :validate="validate"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama Yayasan" name="nama" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup
              label="Jalan/Nomor Bangungan"
              name="address_detail"
              class="mb-3"
              required
            >
              <UInput v-model="state.address_detail" />
            </UFormGroup>

            <UFormGroup
              label="Provinsi Instansi"
              name="province"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.province"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKabupaten"
                placeholder="Pilih Provinsi"
                :options="dataProvinsi"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Kabupaten/Kota Instansi"
              name="city_regency"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.city_regency"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKecamatan"
                placeholder="Pilih Kabupaten/Kota"
                :options="dataKabupaten"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Kecamatan Instansi"
              name="district"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.district"
                color="white"
                variant="outline"
                size="md"
                @change="fetchKelurahan"
                placeholder="Pilih Kecamatan"
                :options="dataKecamatan"
                option-attribute="name"
              />
            </UFormGroup>

            <UFormGroup
              label="Desa/Kelurahan Instansi"
              name="sub_district"
              class="mb-3"
              required
            >
              <USelect
                v-model="state.sub_district"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Desa/Kelurahan"
                :options="dataKelurahan"
                option-attribute="name"
              />
            </UFormGroup>
          </div>
          <div>
            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup
              label="No. Telp Yayasan"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>

            <UFormGroup
              label="Nama Kepala Yayasan"
              name="head_person"
              class="mb-3"
              required
            >
              <UInput v-model="state.head_person" />
            </UFormGroup>
            <UFormGroup label="Logo Yayasan" name="image" class="mb-3" required>
              <input
                type="file"
                variant="none"
                @change="handleFileUpload"
                class="flex items-center border-2 border-gray-300 border-dashed rounded bg-white shadow-sm h-[11em]"
              />
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
  <UModal v-model="isModalLinkOpen" :ui="{ background: 'bg-gray-100' }">
    <div
      class="text-white font-semibold flex items-center justify-between bg-gradient-to-b from-sky-500 to-blue-900 p-4"
    >
      <div>Sinkronisasi</div>
      <button type="button" @click="isModalLinkOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <div class="text-lg mt-3">Hubungkan sekolah untuk {{ currRow.nama }}</div>
      <div class="text-sm text-gray-500 mb-3">Hubungkan ke:</div>
      <USelect
        v-model="selectedNPSN"
        color="white"
        variant="outline"
        size="md"
        placeholder="Pilih sekolah"
        :options="dataSekolah"
        option-attribute="name"
      />
      <div class="flex items-center justify-end mt-32">
        <button
          type="button"
          @click="isModalLinkOpen = false"
          class="px-3 py-2 text-blue-500 border-2 border-blue-500 rounded mr-2"
        >
          Batal
        </button>
        <button
          type="button"
          @click="linkYayasan"
          class="px-3 py-2.5 text-white bg-gradient-to-b rounded from-sky-500 to-blue-900 hover:from-blue-600 hover:to-blue-900"
        >
          Simpan
        </button>
      </div>
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
