<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { PhChartLine, PhSpinner, PhX } from "@phosphor-icons/vue";
import { Bar, Doughnut } from "vue-chartjs";
import { numberToMonth } from "@/utils/date";
import { formatNumberWithDots } from "@/utils/number";
import { getSekolah } from "@/services/sekolah";
import { getGedungSekolah, getInventories } from "@/services/infrastructure";
import {
  getKehadiranHarian,
  getKehadiranBulanan,
  getKehadiranTahunan,
} from "@/services/attendance";
import {
  getAvailableYearsMonths,
  getTransactionSummary,
  getTransactionHistory,
} from "@/services/finance";

useHead({
  title: "Dashboard Penanggung Jawab Sekolah",
});

definePageMeta({
  middleware: ["auth", "is-penanggung-jawab-or-admin"],
});

interface Room {
  location: string;
  quantity: number;
}

interface Building {
  id: number;
  school: string;
  name: string;
  rooms: Room[];
}

interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface Item {
  name: string;
  good: number;
  minor_damage: number;
  major_damage: number;
}

interface Attendance {
  name: string;
  hadir: number;
  izin: number;
  absen: number;
  percentage: string[];
}

interface AvailableYearsMonths {
  year: number;
  months: number[];
}

interface Year {
  name: number;
  value: number;
}

interface Month {
  name: string;
  value: number;
}

interface FinancialTransactionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FinancialTransaction[];
}

interface FinancialTransaction {
  date: string; // Assuming date is in "YYYY-MM-DD" format as a string
  category: string; // A text description of the category
  is_income: boolean; // True for income, false for expenses
  description: string; // A text description of the transaction
  amount: number; // The amount of the transaction
}

const route = useRoute();

let availableYearsMonthsTransaction: AvailableYearsMonths[];
let years: Year[];
const months = ref<Month[]>();

const rangeAbsensi = ref("Harian");
const selectedMonth = ref();
const selectedYear = ref();
const transactionSummary = ref();
const transactionHistory = ref<FinancialTransactionResponse>();
const page = ref(1);

// Ensure that route.params.id is treated as a string
const idParam = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;
// Now you can safely use parseInt, as idParam is guaranteed to be a string
const sekolahId = parseInt(idParam, 10);

const chartData1 = ref<ChartData>({ labels: [], datasets: [] });

const chartData2 = ref<ChartData>({ labels: [], datasets: [] });

const chartOptions = ref({
  responsive: false,
  maintainAspectRatio: false,
  cutout: 60,
  rotation: 180,
  plugins: {
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
        font: {
          weight: 600,
          size: 18,
        },
        generateLabels(chart: any) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const {
              labels: { pointStyle },
            } = chart.legend.options;

            return data.labels.map((label: any, i: any) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);
              const dl = label[0] == "x";

              return {
                text: dl ? label.substring(1) : label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: 10,
                pointStyle: dl ? false : pointStyle,
                hidden: !chart.getDataVisibility(i),
                fontColor: dl ? "#000" : "#6b7280",
                index: i,
              };
            });
          }
          return [];
        },
      },
    },
  },
});

const barChartOptions1 = ref({
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: "y",
  scales: {
    x: {
      stacked: true,
      position: "top",
      ticks: {
        color: "#000",
        font: {
          weight: 600,
        },
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: "#000",
        font: {
          weight: 600,
        },
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        font: {
          weight: 600,
        },
      },
    },
  },
});

const barChartOptions2 = ref({
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: "y",
  scales: {
    x: {
      stacked: true,
      position: "top",
      ticks: {
        color: "#000",
        font: {
          weight: 600,
        },
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: "#000",
        font: {
          weight: 600,
        },
      },
    },
  },
  plugins: {
    legend: {
      reverse: true,
      labels: {
        font: {
          weight: 600,
        },
      },
    },
  },
});

const chartStyle = computed(() => {
  return {
    height: "100%",
    width: "100%",
    position: "relative",
  };
});

const isLoading = ref(true);
const data = ref();
const dataAbsensi = ref<any[]>([]);
const isModalOpen = ref(false);

const toChartAbsesnsi = (dataKehadiran: Attendance[]) => {
  return dataKehadiran.map((e: any) => ({
    ...e,
    chartData: {
      labels: ["Hadir", "Izin", "Absen"]
        .map((status: string, i) => [status, `x${e.percentage[i]}%`])
        .flat(1),
      datasets: [
        {
          backgroundColor: [
            "#3b82f6",
            "#3b82f6",
            "#eab308",
            "#eab308",
            "#dc3545",
            "#dc3545",
          ],
          data: [e.hadir, 0, e.izin, 0, e.absen, 0],
        },
      ],
    },
  }));
};

const handleRangeChange = async () => {
  switch (rangeAbsensi.value) {
    case "Bulanan": {
      const dataAbsensiBulanan = await getKehadiranBulanan(sekolahId);
      dataAbsensi.value = toChartAbsesnsi(dataAbsensiBulanan);
      break;
    }
    case "Tahunan": {
      const dataAbsensiTahunan = await getKehadiranTahunan(sekolahId);
      dataAbsensi.value = toChartAbsesnsi(dataAbsensiTahunan);
      break;
    }
    default: {
      const dataAbsensiHarian = await getKehadiranHarian(sekolahId);
      dataAbsensi.value = toChartAbsesnsi(dataAbsensiHarian);
      break;
    }
  }
  isLoading.value = false;
};

const fetchTransactionHistory = async () => {
  if (selectedYear.value && selectedMonth.value) {
    transactionHistory.value = await getTransactionHistory(
      sekolahId,
      page.value,
      selectedYear.value,
      selectedMonth.value
    );
  } else if (selectedYear.value) {
    transactionHistory.value = await getTransactionHistory(
      sekolahId,
      page.value,
      selectedYear.value
    );
  } else {
    transactionHistory.value = await getTransactionHistory(
      sekolahId,
      page.value
    );
  }
};

const openModal = async () => {
  page.value = 1;
  fetchTransactionHistory();
  isModalOpen.value = true;
};

const changeMonths = () => {
  months.value = availableYearsMonthsTransaction
    .filter((item) => item.year === parseInt(selectedYear.value))[0]
    .months.map((month) => ({ value: month, name: numberToMonth(month) }));
};

const changeTransactionData = async () => {
  if (selectedYear.value && selectedMonth.value) {
    transactionSummary.value = await getTransactionSummary(
      sekolahId,
      selectedYear.value,
      selectedMonth.value
    );
  } else if (selectedYear.value) {
    transactionSummary.value = await getTransactionSummary(
      sekolahId,
      selectedYear.value
    );
  } else {
    transactionSummary.value = await getTransactionSummary(sekolahId);
  }
};

const onYearChange = () => {
  changeMonths();
  const monthExist = months.value?.some(
    (obj) => obj.value === selectedMonth.value
  );
  if (!monthExist) {
    selectedMonth.value = months.value[0].value;
  }
  changeTransactionData();
};

onMounted(() => {
  nextTick(async () => {
    data.value = await getSekolah(sekolahId);

    const buildings: Building[] = await getGedungSekolah(sekolahId);

    // Function to generate a random color
    const generateRandomColor = (): string =>
      "#" + Math.floor(Math.random() * 16777215).toString(16);

    // Dynamically extract floor labels with explicit type assertion
    const floorLabels: string[] = [];
    buildings.forEach((building) => {
      building.rooms.forEach((room) => {
        const location = room.location; // Type assertion here if necessary
        if (!floorLabels.includes(location)) {
          floorLabels.push(location);
        }
      });
    });

    // Initialize datasets with explicit types and ensure type safety
    const datasets: Dataset[] = floorLabels.map((label) => ({
      label: label, // Type assertion here if necessary
      data: [] as number[], // Ensuring data is typed as number[]
      backgroundColor: generateRandomColor(),
    }));

    // Fill in labels and datasets
    const labels: string[] = buildings.map(
      (building: Building) => building.name
    );

    buildings.forEach((building: Building) => {
      const floorData = new Array(floorLabels.length).fill(0); // Temporary storage for floor data
      building.rooms.forEach((room) => {
        const floorIndex = floorLabels.indexOf(room.location);
        if (floorIndex !== -1) {
          floorData[floorIndex] = room.quantity;
        }
      });
      // Distribute the collected floor data to the respective datasets
      floorData.forEach((quantity, index) => {
        datasets[index].data.push(quantity);
      });
    });

    chartData1.value.labels = labels;
    chartData1.value.datasets = datasets;

    const inventories: Item[] = await getInventories(sekolahId);
    chartData2.value = {
      labels: inventories.map((item) => item.name),
      datasets: [
        {
          label: "Rusak Berat",
          data: inventories.map((item) => item.major_damage),
          backgroundColor: "#dc3545",
        },
        {
          label: "Rusak Ringan",
          data: inventories.map((item) => item.minor_damage),
          backgroundColor: "#ffc107",
        },
        {
          label: "Baik",
          data: inventories.map((item) => item.good),
          backgroundColor: "#20c997",
        },
      ],
    };

    // Fetch data absensi
    const dataAbsensiHarian = await getKehadiranHarian(sekolahId);
    dataAbsensi.value = toChartAbsesnsi(dataAbsensiHarian);

    // Fetch data transaksi
    availableYearsMonthsTransaction = await getAvailableYearsMonths(sekolahId);
    if (availableYearsMonthsTransaction.length > 0) {
      years = availableYearsMonthsTransaction.map((data) => ({
        name: data.year,
        value: data.year,
      }));

      // Set default selected year and month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      selectedYear.value = currentYear;
      onYearChange();
      selectedMonth.value = currentMonth;
      // Fetch initial transaction summary
    }
    changeTransactionData();

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
            <h1 class="text-white/75">Dashboard</h1>
          </div>
          <div class="mt-4 flex flex-wrap w-full">
            <div class="pr-4 pb-4 w-1/5">
              <div
                class="p-4 h-full rounded-lg flex flex-col items-center justify-center bg-white"
              >
                <img :src="data.image" alt="Logo" class="img-fill-container" />
              </div>
            </div>
            <div class="pl-4 pb-4 w-4/5">
              <div
                class="px-6 py-8 h-full rounded-lg flex flex-col bg-white shadow-lg"
              >
                <div class="text-2xl font-semibold">Informasi Sekolah</div>
                <table class="w-100 mt-2">
                  <tbody>
                    <tr>
                      <td class="font-medium w-48">Nama Sekolah</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.name }}</td>
                    </tr>
                    <tr>
                      <td class="font-medium w-48">NPSN</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.npsn }}</td>
                    </tr>
                    <tr>
                      <td class="font-medium w-48">Alamat Sekolah</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.address.complete_address }}</td>
                    </tr>
                    <tr>
                      <td class="font-medium w-48">Email Sekolah</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.email }}</td>
                    </tr>
                    <tr>
                      <td class="font-medium w-48">Kepala Sekolah</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.head_person }}</td>
                    </tr>
                    <tr>
                      <td class="font-medium w-48">Terhubung ke</td>
                      <td class="font-medium">:</td>
                      <td>{{ data.linked_yayasan }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="py-4 w-full">
              <div class="px-6 py-8 rounded-lg bg-white shadow-lg">
                <div class="text-xl font-semibold">Maps Lokasi</div>
                <div class="text-xs text-gray-500">
                  {{ data.address.complete_address }}
                </div>
                <iframe
                  :src="`https://maps.google.com/maps?q=${data.address.complete_address}&t=&z=13&ie=UTF8&iwloc=&output=embed`"
                  class="rounded-lg w-full h-96 border-4 border-gray-400/75 shadow-lg mt-2"
                  frameborder="0"
                  scrolling="no"
                  marginheight="0"
                  marginwidth="0"
                ></iframe>
              </div>
            </div>
            <div v-if="dataAbsensi.length" class="py-4 w-full">
              <div class="px-6 py-8 rounded-lg bg-white shadow-lg">
                <div class="flex items-center justify-between mb-6">
                  <div class="text-xl font-semibold">Absensi</div>
                  <USelect
                    v-model="rangeAbsensi"
                    @change="handleRangeChange"
                    :options="['Harian', 'Bulanan', 'Tahunan']"
                    :ui="{ rounded: 'rounded-none' }"
                    class="border-1 border-gray-700"
                  />
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <template v-for="e in dataAbsensi" :key="e.name">
                    <div
                      class="border-4 border-gray-400/75 rounded-lg p-6 shadow-lg"
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="text-medium font-semibold">
                            Kehadiran {{ e.name }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ rangeAbsensi }}
                          </div>
                        </div>
                        <PhChartLine weight="fill" class="h-5 w-5" />
                      </div>
                      <div class="flex justify-center h-100">
                        <div>
                          <Doughnut
                            :data="e.chartData"
                            :options="chartOptions"
                          />
                        </div>
                      </div>
                      <div>
                        <div class="text-medium font-semibold">
                          Detail Kehadiran
                        </div>
                        <div class="grid grid-cols-10">
                          <div class="col-span-1 flex justify-end mt-3">
                            <div
                              class="bg-blue-500 h-4 w-4 rounded-full mr-2 mt-1"
                            ></div>
                          </div>
                          <div class="col-span-9 mt-3">
                            <div class="text-gray-500 font-semibold">
                              Total Kehadiran
                            </div>
                            <div class="text-xl font-semibold">
                              {{
                                e.hadir
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                              }}
                              {{ e.name }}
                            </div>
                          </div>
                          <div class="col-span-1 flex justify-end mt-3">
                            <div
                              class="bg-yellow-500 h-4 w-4 rounded-full mr-2 mt-1"
                            ></div>
                          </div>
                          <div class="col-span-9 mt-3">
                            <div class="text-gray-500 font-semibold">
                              Total Izin
                            </div>
                            <div class="text-xl font-semibold">
                              {{
                                e.absen
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                              }}
                              {{ e.name }}
                            </div>
                          </div>
                          <div class="col-span-1 flex justify-end mt-3">
                            <div
                              class="bg-red-500 h-4 w-4 rounded-full mr-2 mt-1"
                            ></div>
                          </div>
                          <div class="col-span-9 mt-3">
                            <div class="text-gray-500 font-semibold">
                              Total Absen
                            </div>
                            <div class="text-xl font-semibold">
                              {{
                                e.absen
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                              }}
                              {{ e.name }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="py-4 w-1/3">
              <div class="mr-4 px-6 py-8 rounded-lg bg-white shadow-lg h-full">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <div class="text-xl font-semibold">Laporan Keuangan</div>
                    <div class="text-xs text-gray-500">Pemasukan</div>
                  </div>
                </div>
                <div class="font-semibold text-gray-500">
                  <div class="flex justify-start">
                    <div class="select-container mr-3">
                      <USelect
                        v-model="selectedYear"
                        :ui="{ rounded: 'rounded-none' }"
                        class="text-xs border-1 border-gray-700 text-sm"
                        placeholder="Pilih Tahun"
                        :options="years"
                        option-attribute="name"
                        @change="onYearChange"
                        clearable
                      />
                      <button
                        class="clear-button"
                        :class="{ invisible: !selectedYear }"
                        @click="
                          () => {
                            selectedYear = null;
                            selectedMonth = null;
                            months = [];
                            changeTransactionData();
                          }
                        "
                      >
                        &#x2715;
                      </button>
                    </div>
                    <div class="select-container">
                      <USelect
                        v-model="selectedMonth"
                        :ui="{ rounded: 'rounded-none' }"
                        class="border-1 border-gray-700 text-sm"
                        placeholder="Pilih Bulan"
                        :options="months"
                        option-attribute="name"
                        @change="changeTransactionData"
                        clearable
                      />
                      <button
                        class="clear-button"
                        :class="{ invisible: !selectedMonth }"
                        @click="
                          () => {
                            selectedMonth = null;
                            changeTransactionData();
                          }
                        "
                      >
                        &#x2715;
                      </button>
                    </div>
                  </div>
                  <div class="my-4">
                    <div>Pemasukan</div>
                    <div>
                      <span class="text-black"
                        >Rp.
                        {{
                          formatNumberWithDots(transactionSummary?.income)
                        }}</span
                      >
                    </div>
                  </div>
                  <div class="my-4">
                    <div>Pengeluaran</div>
                    <div>
                      <span class="text-black"
                        >Rp.
                        {{
                          formatNumberWithDots(transactionSummary?.expense)
                        }}</span
                      >
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  @click="openModal"
                >
                  Riwayat Transaksi
                </button>
              </div>
            </div>
            <div class="py-4 w-2/3">
              <div class="ml-4 px-6 py-8 rounded-lg bg-white shadow-lg h-full">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xl font-semibold">
                      Laporan Sarana Prasarana
                    </div>
                    <div class="text-xs text-gray-500">
                      Gedung & Ruangan (Jumlah Ruangan)
                    </div>
                  </div>
                </div>
                <div class="flex items-center w-full h-60">
                  <Bar
                    :data="chartData1"
                    :options="barChartOptions1"
                    :style="chartStyle"
                  />
                </div>
              </div>
            </div>
            <div class="py-4 w-full">
              <div class="px-6 py-8 rounded-lg bg-white shadow-lg h-full">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <div class="text-xl font-semibold">
                      Laporan Sarana Prasarana
                    </div>
                    <div class="text-xs text-gray-500">
                      Inventaris Barang (Jumlah Barang)
                    </div>
                  </div>
                </div>
                <div class="flex items-center w-full h-46">
                  <Bar
                    :data="chartData2"
                    :options="barChartOptions2"
                    :style="chartStyle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UModal
        v-model="isModalOpen"
        :ui="{ background: 'bg-white', base: 'sm:!max-w-4xl' }"
      >
        <div class="font-semibold flex items-center justify-between p-8">
          <div>Detail Transaksi Pemasukan & Pengeluaran</div>
          <button type="button" @click="isModalOpen = false">
            <PhX />
          </button>
        </div>
        <div class="px-8 pb-8">
          <div class="flex justify-between items-center p-4 bg-white shadow-md">
            <div class="text-sm text-gray-600">
              Entries:
              <span class="font-semibold"
                >{{
                  page * 10 < transactionHistory?.count
                    ? page * 10
                    : transactionHistory?.count
                }}
                of {{ transactionHistory?.count }}</span
              >
            </div>
            <div class="flex items-center">
              <label for="search" class="text-gray-600 mr-2">Search:</label>
              <input
                type="text"
                id="search"
                class="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <table
            class="table-auto border-collapse border mt-6 w-full text-center"
          >
            <thead>
              <tr>
                <th class="border px-2 py-1 font-semibold" rowspan="2">
                  Tanggal
                </th>
                <th class="border px-2 py-1 font-semibold" rowspan="2">
                  Kategori
                </th>
                <th class="border px-2 py-1 font-semibold" rowspan="2">
                  Keterangan
                </th>
                <th class="border px-2 py-1 font-semibold" colspan="2">
                  Jenis
                </th>
              </tr>
              <tr>
                <th class="border px-2 py-1 font-semibold">Pemasukan</th>
                <th class="border px-2 py-1 font-semibold">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(e, i) in transactionHistory?.results"
                :key="i"
                class="odd:bg-gray-50"
              >
                <td class="border px-2 py-1">{{ e.date }}</td>
                <td class="border px-2 py-1">{{ e.category }}</td>
                <td class="border px-2 py-1">{{ e.description }}</td>
                <td class="border px-2 py-1">
                  {{
                    e.is_income ? `Rp${formatNumberWithDots(e.amount)},-` : "-"
                  }}
                </td>
                <td class="border px-2 py-1">
                  {{
                    e.is_income ? "-" : `Rp${formatNumberWithDots(e.amount)},-`
                  }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end mt-4 space-x-2">
            <button
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="
                () => {
                  if (page > 1) {
                    page -= 1;
                    fetchTransactionHistory();
                  }
                }
              "
            >
              Previous
            </button>
            <button
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="
                () => {
                  if (page * 10 < transactionHistory?.count) {
                    page += 1;
                    fetchTransactionHistory();
                  }
                }
              "
            >
              Next
            </button>
          </div>
        </div>
      </UModal>
    </template>
  </div>
</template>

<style>
.select-container {
  display: flex;
  align-items: center; /* Ensure vertical alignment is centered */
}

.clear-button {
  margin-left: 8px; /* Adjust spacing between USelect and the clear button */
  background: none;
  border: none;
  cursor: pointer;
  color: #333; /* Adjust color as needed */
}

/* Additional styling for the USelect component might be needed */
</style>
