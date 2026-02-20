<template>
  <client-only>
    <VChart class="chart" :option="option" autoresize />
  </client-only>
</template>

<script setup lang="ts">
import { provide, computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent]);
provide(THEME_KEY, "light");

const props = defineProps<{
  labels?: string[];
  values?: number[];
}>();

const fallbackLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const fallbackInpatient = [22, 28, 24, 20, 26, 30, 27];
const fallbackOutpatient = [32, 34, 30, 36, 39, 38, 34];

const option = computed(() => ({
  color: ["#0ea5e9", "#22c55e"],
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 0,
    textStyle: { color: "#f9fafb" },
    padding: [8, 12],
  },
  legend: {
    data: ["Rawat Inap", "Rawat Jalan"],
    top: 0,
    right: 0,
    textStyle: {
      color: "#4b5563",
      fontSize: 12,
    },
  },
  grid: {
    top: 48,
    left: 12,
    right: 12,
    bottom: 20,
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: props.labels?.length ? props.labels : fallbackLabels,
    axisLine: { lineStyle: { color: "#e5e7eb" } },
    axisLabel: { color: "#6b7280" },
  },
  yAxis: {
    type: "value",
    axisLine: { show: false },
    splitLine: { lineStyle: { color: "#f3f4f6" } },
    axisLabel: { color: "#6b7280" },
  },
  series: [
    {
      name: "Rawat Inap",
      type: "line",
      smooth: true,
      areaStyle: {
        opacity: 0.2,
      },
      symbol: "circle",
      symbolSize: 8,
      data: props.values?.length ? props.values : fallbackInpatient,
    },
    {
      name: "Rawat Jalan",
      type: "line",
      smooth: true,
      areaStyle: {
        opacity: 0.15,
      },
      symbol: "circle",
      symbolSize: 8,
      data: fallbackOutpatient,
    },
  ],
}));
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 16rem;
  width: 100%;
}
</style>
