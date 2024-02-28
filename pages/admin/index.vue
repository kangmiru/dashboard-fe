<script setup lang="ts">
import { PhSpinner } from "@phosphor-icons/vue";
import { Doughnut } from "vue-chartjs";
import { countPenanggungJawab } from "@/services/penanggungJawab";
import { countSekolah } from "@/services/sekolah";
import { countYayasan } from "@/services/yayasan";
import {
  getStatsInstansi,
  getStatsPenanggungJawab,
} from "@/services/statistics";

definePageMeta({
  layout: "admin",
  middleware: ["auth", "is-admin"],
});
useHead({
  title: "Dashboard",
});

interface StatsData {
  name: string;
  value: number;
  percentage: number;
}

const chartData1 = ref({
  labels: [],
  datasets: [
    {
      backgroundColor: [],
      data: [],
    },
  ],
});

const chartData2 = ref({
  labels: <StatsData[]>[],
  datasets: [
    {
      backgroundColor: <any[]>[],
      data: <StatsData[]>[],
    },
  ],
});

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

const isLoading = ref(true);
const data = ref();
const totalYayasan = ref<number>();
const totalSekolah = ref<number>();
const totalPenanggungJawab = ref<number>();

onMounted(() => {
  nextTick(async () => {
    // Total yayasan
    totalYayasan.value = await countYayasan();

    // Total Sekolah
    totalSekolah.value = await countSekolah();

    // Total Penanggung Jawab
    totalPenanggungJawab.value = await countPenanggungJawab();

    // Fetch data statistik penanggung jawab
    const data_chart1 = await getStatsPenanggungJawab();

    // Fetch data statistik instansi (yayasan dan sekolah)
    const data_chart2 = await getStatsInstansi();

    chartData1.value.labels = data_chart1
      .map((e: any) => [e.name, `x${e.percentage}%`])
      .flat(1);
    chartData1.value.datasets = [
      {
        backgroundColor: data_chart1
          .map(() => ["#148ff2", "#148ff2", "#d92b3c", "#d92b3c"])
          .flat(1),
        data: data_chart1.map((e: any) => [e.value, 0]).flat(1),
      },
    ];

    chartData2.value.labels = data_chart2
      .map((e: any) => [e.name, `x${e.percentage}%`])
      .flat(1);
    chartData2.value.datasets = [
      {
        backgroundColor: data_chart2
          .map(() => ["#148ff2", "#148ff2", "#d92b3c", "#d92b3c"])
          .flat(1),
        data: data_chart2.map((e: any) => [e.value, 0]).flat(1),
      },
    ];

    // Loading data complete
    isLoading.value = false;
  });
});
</script>

<template>
  <div :class="isLoading ? 'px-6 py-8 h-full' : 'px-6 py-8'">
    <h1 class="font-semibold">Dashboard Admin</h1>
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <PhSpinner :size="48" class="animate-spin" />
    </div>
    <template v-else>
      <div class="grid grid-cols-3 gap-6 mt-6">
        <div
          class="relative bg-gradient-to-br from-violet-600 to-violet-300 rounded-lg p-10 text-white drop-shadow-lg"
        >
          <p class="text-lg">Total</p>
          <p class="text-lg">Yayasan</p>
          <p class="font-semibold text-2xl mt-6">{{ totalYayasan }}</p>
          <img
            src="~/assets/img/eclipse.svg"
            alt="eclipse"
            class="absolute bottom-0 right-0 rounded-br-lg"
          />
        </div>
        <div
          class="relative bg-gradient-to-br from-sky-600 to-sky-300 rounded-lg p-10 text-white drop-shadow-lg"
        >
          <p class="text-lg">Total</p>
          <p class="text-lg">Sekolah</p>
          <p class="font-semibold text-2xl mt-6">{{ totalSekolah }}</p>
          <img
            src="~/assets/img/eclipse.svg"
            alt="eclipse"
            class="absolute bottom-0 right-0 rounded-br-lg"
          />
        </div>
        <div
          class="relative bg-gradient-to-br from-emerald-600 to-emerald-300 rounded-lg p-10 text-white drop-shadow-lg"
        >
          <p class="text-lg">Total</p>
          <p class="text-lg">Penanggung Jawab</p>
          <p class="font-semibold text-2xl mt-6">{{ totalPenanggungJawab }}</p>
          <img
            src="~/assets/img/eclipse.svg"
            alt="eclipse"
            class="absolute bottom-0 right-0 rounded-br-lg"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-6 my-6">
        <div class="bg-white rounded-lg p-10 drop-shadow-lg">
          <div class="font-semibold text-lg">
            Statistik Total Aktivitas Penanggung Jawab
          </div>
          <!-- <div class="font-semibold text-gray-500">
            {{ data.statistik_pj.bulan }}
          </div> -->
          <div class="flex justify-center h-100">
            <div>
              <Doughnut :data="chartData1" :options="chartOptions" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-10 drop-shadow-lg">
          <div class="font-semibold text-lg">
            Statistik Total Yayasan & Sekolah
          </div>
          <!-- <div class="font-semibold text-gray-500">
            {{ data.statistik_ys.bulan }}
          </div> -->
          <div class="flex justify-center h-100">
            <div>
              <Doughnut :data="chartData2" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
