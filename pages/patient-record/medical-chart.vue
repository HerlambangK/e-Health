<template>
  <div
    class="mt-5 pb-10 flex-grow"
  >
    <p class="font-bold">Grafik Jumlah Pasien di e-Health</p>
    <div class="mt-5 h-[300px] rounded-lg border bg-background md:p-3">
      <Line :data="data" :options="options" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: ["auth", "auth-middleware"],
});
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "vue-chartjs";
import colors from "#tailwind-config/theme/colors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { data: summaryResponse } = await useAsyncData(
  "dashboard-summary",
  () => $fetch("/api/dashboard/summary"),
  {
    default: () => ({ data: null }),
  }
);

const summary = computed(() => summaryResponse.value?.data);

const mode = useColorMode();

const options = computed<ChartOptions<"line">>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: mode.value === "dark" ? colors.slate[900] : colors.slate[200],
        },
        ticks: {
          color: colors.slate[500],
        },
      },
      x: {
        grid: {
          color: mode.value === "dark" ? colors.slate[800] : colors.slate[200],
        },
        ticks: {
          color: colors.slate[500],
        },
      },
    },
  };
});

const data = computed<ChartData<"line">>(() => {
  const labels = summary.value?.visitTrend?.labels ?? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const values = summary.value?.visitTrend?.values ?? [12, 18, 10, 16, 22, 14, 19];

  return {
    labels,
    datasets: [
      {
        label: "Kunjungan Pasien",
        backgroundColor: colors.white,
        tension: 0.4,
        borderColor: colors.blue[500],
        borderWidth: 2,
        pointBackgroundColor: colors.blue[500],
        data: values,
      },
    ],
  };
});
</script>
