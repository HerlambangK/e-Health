<template>
  <client-only>
    <VChart class="chart" :option="option" autoresize />
  </client-only>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent]);
provide(THEME_KEY, "light");

const option = ref({
  color: ["#6366f1", "#f97316", "#22c55e"],
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 0,
    textStyle: { color: "#f9fafb" },
    padding: [8, 12],
  },
  legend: {
    top: 0,
    right: 0,
    textStyle: { color: "#4b5563", fontSize: 12 },
  },
  grid: {
    top: 42,
    left: 14,
    right: 12,
    bottom: 14,
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: ["ICU", "Rawat Inap", "UGD", "Poli Umum"],
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
      name: "Kapasitas",
      type: "bar",
      stack: "total",
      barWidth: 18,
      data: [24, 86, 40, 64],
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    },
    {
      name: "Terisi",
      type: "bar",
      stack: "total",
      barWidth: 18,
      data: [18, 64, 28, 48],
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    },
    {
      name: "Sisa",
      type: "bar",
      stack: "total",
      barWidth: 18,
      data: [6, 22, 12, 16],
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    },
  ],
});
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 14rem;
  width: 100%;
}
</style>
