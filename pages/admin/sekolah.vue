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
import {
  getProvinsi,
  getKabupaten,
  getKecamatan,
  getKelurahan,
} from "@/services/location";
import {
  getAllSekolah,
  addSekolah,
  updateSekolah,
  deleteSekolah,
  getKategoriSekolah,
} from "@/services/sekolah";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "is-admin"],
});
useHead({
  title: "Sekolah",
});

const isLoading = ref(true);
const data = ref([]);
const dataProvinsi = ref([]);
const dataKabupaten = ref([]);
const dataKecamatan = ref([]);
const dataKelurahan = ref([]);
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
  npsn: string;
  name: string;
  category: number;
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

interface Result {
  name: string;
  value: number;
}

const state = reactive<State>({
  name: "",
  category: 0,
  npsn: "",
  id: 0,
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

const dataKategoriSekolah = ref<Result[]>([]);

const columns = [
  {
    key: "name",
    label: "Nama",
  },
  {
    key: "npsn",
    label: "NPSN",
  },
  {
    key: "address.complete_address",
    label: "Alamat",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "head_person",
    label: "Kepala Sekolah",
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
  state.category = 0;
  state.npsn = "";
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
  state.category = row.category.id;
  state.npsn = row.npsn;
  state.email = row.email;
  state.image = null;

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
  if (!state.npsn) errors.push({ path: "npsn", message: "Required" });
  if (!state.category) errors.push({ path: "category", message: "Required" });
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

async function onSubmit() {
  const dataToSend = new FormData();
  dataToSend.append("name", String(state.name));
  dataToSend.append("npsn", String(state.npsn));
  dataToSend.append("category", String(state.category));
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
      await addSekolah(dataToSend);
    } catch (e) {
      console.log(e);
    }
    isModalAddOpen.value = false;
  }
  if (isModalEditOpen.value) {
    try {
      await updateSekolah(state.id, dataToSend);
    } catch (e) {
      console.log(e);
    }
    isModalEditOpen.value = false;
  }
  data.value = await getAllSekolah();
}

async function onDelete() {
  try {
    await deleteSekolah(state.id);
  } catch (e) {
    console.log(e);
  }
  data.value = await getAllSekolah();
  isModalDeleteOpen.value = false;
}

const rows = computed(() => {
  return data.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

// Fetch table data Sekolah
onMounted(() => {
  nextTick(async () => {
    data.value = await getAllSekolah();
    isLoading.value = false;
  });
});

onMounted(() => {
  nextTick(async () => {
    dataKategoriSekolah.value = await getKategoriSekolah();
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
        <h1>Daftar Sekolah</h1>
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
          <template #name-data="{ row }">
            <NuxtLink :to="`/sekolah/${row.id}`">
              <p class="text-primary">{{ row.name }}</p>
            </NuxtLink>
          </template>
          <template #link-data="{ row }">
            <div class="flex justify-center font-semibold">
              <button
                type="button"
                @click="showModalLink(row)"
                :class="
                  'text-' + (row.linked_yayasan ? 'blue-500' : 'gray-400')
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
      <div>Tambah Data Sekolah</div>
      <button type="button" @click="isModalAddOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama Sekolah" name="name" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup label="Kategori" name="category" class="mb-3" required>
              <USelect
                v-model="state.category"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Kategori"
                :options="dataKategoriSekolah"
                option-attribute="name"
              />
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
              label="No. Telp Sekolah"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>

            <UFormGroup
              label="Nomor Pokok Sekolah Nasional"
              name="npsn"
              class="mb-3"
              required
            >
              <UInput v-model="state.npsn" />
            </UFormGroup>

            <UFormGroup
              label="Nama Kepala Sekolah"
              name="head_person"
              class="mb-3"
              required
            >
              <UInput v-model="state.head_person" />
            </UFormGroup>
            <UFormGroup label="Logo Sekolah" name="image" class="mb-3" required>
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
      <template v-if="currRow.linked_yayasan">
        <div class="text-lg mt-3">Sekolah Sudah Terhubung Dengan Yayasan :</div>
        <div class="text-lg text-gray-500 mb-3">
          {{ currRow.linked_yayasan }}
        </div>
      </template>
      <template v-else>
        <div class="text-lg text-gray-500 my-3">
          Sekolah Belum Terhubung Dengan Yayasan
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
      <div>Edit Data Sekolah</div>
      <button type="button" @click="isModalEditOpen = false">
        <PhX />
      </button>
    </div>
    <div class="flex flex-col font-medium p-6">
      <UForm
        :validate="validate"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-6">
          <div>
            <UFormGroup label="Nama Sekolah" name="name" class="mb-3" required>
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup label="Kategori" name="category" class="mb-3" required>
              <USelect
                v-model="state.category"
                color="white"
                variant="outline"
                size="md"
                placeholder="Pilih Kategori"
                :options="dataKategoriSekolah"
                option-attribute="name"
              />
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
              label="No. Telp Sekolah"
              name="phone_number"
              class="mb-3"
              required
            >
              <UInput v-model="state.phone_number" />
            </UFormGroup>

            <UFormGroup
              label="Nomor Pokok Sekolah Nasional"
              name="npsn"
              class="mb-3"
              required
            >
              <UInput v-model="state.npsn" />
            </UFormGroup>

            <UFormGroup
              label="Nama Kepala Sekolah"
              name="head_person"
              class="mb-3"
              required
            >
              <UInput v-model="state.head_person" />
            </UFormGroup>

            <UFormGroup label="Logo Sekolah" name="image" class="mb-3" required>
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
