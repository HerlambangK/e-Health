<template>
  <client-only>
    <VChart class="chart" :option="option" autoresize />
  </client-only>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

provide(THEME_KEY, "light");

const patientDistribution = [
  { value: 24, name: "Rawat inap" },
  { value: 8, name: "ICU / Urgent" },
  { value: 12, name: "UGD / Rawat jalan" },
  { value: 12, name: "Dalam antrian" },
  { value: 42, name: "Telah ditangani" },
];

const option = ref({
  color: ["#4b5563", "#f97316", "#fbbf24", "#22c55e", "#0ea5e9"],
  title: {
    text: "Komposisi Pasien",
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: "#111827",
    },
  },
  tooltip: {
    trigger: "item",
    formatter: ({ name, value, percent }: any) =>
      `<strong>${name}</strong><br />${value} pasien (${percent}%)`,
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderWidth: 0,
    textStyle: {
      color: "#f9fafb",
    },
    padding: [8, 12],
  },
  legend: {
    orient: "vertical",
    right: 0,
    top: "middle",
    textStyle: {
      color: "#4b5563",
    },
    icon: "circle",
  },
  series: [
    {
      name: "Status Pasien",
      type: "pie",
      radius: ["48%", "70%"],
      center: ["40%", "52%"],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: "{d}%",
        color: "#1f2937",
        fontSize: 12,
      },
      labelLine: {
        smooth: true,
        length: 12,
        length2: 8,
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      data: patientDistribution,
      emphasis: {
        scale: true,
        scaleSize: 8,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: "rgba(14, 165, 233, 0.25)",
        },
        label: {
          show: true,
          fontWeight: 600,
          formatter: "{b}\n{c} pasien",
        },
      },
    },
  ],
  media: [
    {
      query: { maxWidth: 640 },
      option: {
        legend: {
          orient: "horizontal",
          top: "bottom",
          left: "center",
        },
        series: [
          {
            center: ["50%", "45%"],
            radius: ["45%", "70%"],
          },
        ],
      },
    },
  ],
});
</script>

<style scoped>
.chart {
  height: 100%;
  min-height: 18rem;
  width: 100%;
}
</style>
