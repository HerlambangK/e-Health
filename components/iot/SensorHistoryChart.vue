<template>
	<div class="space-y-3">
		<!-- Parameter & Time Range Selector -->
		<div
			class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
		>
			<!-- Parameter Chips -->
			<div class="flex items-center gap-1.5 flex-wrap">
				<span class="text-xs font-semibold text-gray-500 mr-1">Parameter:</span>
				<button
					v-for="param in availableParams"
					:key="param.key"
					type="button"
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
					:class="
						selectedParamKey === param.key
							? 'bg-primary-600 text-white shadow-sm'
							: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
					"
					@click="selectedParamKey = param.key"
				>
					{{ param.name }} ({{ param.unit }})
				</button>
			</div>

			<!-- Time Range Filter -->
			<div class="flex items-center gap-1 bg-white dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
				<button
					v-for="r in rangeOptions"
					:key="r.value"
					type="button"
					class="px-2.5 py-1 text-xs font-medium rounded-md transition-all"
					:class="
						selectedRange === r.value
							? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
					"
					@click="selectedRange = r.value"
				>
					{{ r.label }}
				</button>
			</div>
		</div>

		<!-- Summary Stats Badges -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
			<div class="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
				<span class="text-[11px] text-gray-400">Terakhir</span>
				<p class="text-base font-bold text-gray-900 dark:text-white font-mono">
					{{ stats.last ?? '-' }} <span class="text-xs font-normal text-gray-500">{{ currentParamMeta?.unit }}</span>
				</p>
			</div>
			<div class="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
				<span class="text-[11px] text-gray-400">Rata-Rata</span>
				<p class="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
					{{ stats.avg ?? '-' }} <span class="text-xs font-normal text-gray-500">{{ currentParamMeta?.unit }}</span>
				</p>
			</div>
			<div class="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
				<span class="text-[11px] text-gray-400">Minimum</span>
				<p class="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
					{{ stats.min ?? '-' }} <span class="text-xs font-normal text-gray-500">{{ currentParamMeta?.unit }}</span>
				</p>
			</div>
			<div class="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
				<span class="text-[11px] text-gray-400">Maksimum</span>
				<p class="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
					{{ stats.max ?? '-' }} <span class="text-xs font-normal text-gray-500">{{ currentParamMeta?.unit }}</span>
				</p>
			</div>
		</div>

		<!-- ECharts Container -->
		<div
			ref="chartContainer"
			class="w-full h-72 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 relative"
		>
			<div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
				<UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-primary-500" />
			</div>
			<div v-if="!loading && chartData.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
				<UIcon name="i-heroicons-chart-bar" class="w-8 h-8 mb-1 text-gray-300" />
				<p class="text-xs">Belum ada rekaman telemetri pada rentang waktu ini</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import * as echarts from 'echarts';

	interface ParamMeta {
		key: string;
		name: string;
		unit: string;
		minThreshold?: number;
		maxThreshold?: number;
	}

	interface Props {
		deviceId: string;
		availableParams?: ParamMeta[];
	}

	const props = withDefaults(defineProps<Props>(), {
		availableParams: () => [
			{ key: 'temperature', name: 'Suhu', unit: '°C' },
			{ key: 'humidity', name: 'Kelembaban', unit: '%' },
		],
	});

	const chartContainer = ref<HTMLElement | null>(null);
	let chartInstance: echarts.ECharts | null = null;

	const loading = ref(false);
	const selectedRange = ref('24h');
	const selectedParamKey = ref(props.availableParams[0]?.key || 'temperature');
	const chartData = ref<any[]>([]);

	const rangeOptions = [
		{ label: '1 Jam', value: '1h' },
		{ label: '24 Jam', value: '24h' },
		{ label: '7 Hari', value: '7d' },
	];

	const currentParamMeta = computed(() => {
		return (
			props.availableParams.find((p) => p.key === selectedParamKey.value) ||
			props.availableParams[0]
		);
	});

	const stats = computed(() => {
		if (!chartData.value || chartData.value.length === 0) {
			return { last: null, avg: null, min: null, max: null };
		}
		const values = chartData.value
			.map((d) => d.val)
			.filter((v) => typeof v === 'number');
		if (values.length === 0) return { last: null, avg: null, min: null, max: null };

		const last = values[values.length - 1];
		const min = Math.min(...values);
		const max = Math.max(...values);
		const sum = values.reduce((a, b) => a + b, 0);
		const avg = (sum / values.length).toFixed(1);

		return {
			last: typeof last === 'number' ? last.toFixed(1) : last,
			avg,
			min: min.toFixed(1),
			max: max.toFixed(1),
		};
	});

	async function loadTelemetry() {
		if (!props.deviceId) return;
		loading.value = true;
		try {
			const res = await $fetch<any>(
				`/api/iot/sensor/telemetry?deviceId=${props.deviceId}&range=${selectedRange.value}`,
			);
			const logs = res?.data?.logs || [];
			chartData.value = logs
				.map((l: any) => ({
					time: new Date(l.timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
					fullTime: new Date(l.timestamp).toLocaleString(),
					val: l.data?.[selectedParamKey.value],
				}))
				.filter((d: any) => typeof d.val === 'number');

			renderChart();
		} catch (err) {
			console.error('Error fetching telemetry chart:', err);
		} finally {
			loading.value = false;
		}
	}

	function renderChart() {
		if (!chartContainer.value) return;
		if (!chartInstance) {
			chartInstance = echarts.init(chartContainer.value);
		}

		const times = chartData.value.map((d) => d.time);
		const vals = chartData.value.map((d) => d.val);
		const unit = currentParamMeta.value?.unit || '';

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'axis',
				formatter: (params: any) => {
					const p = params[0];
					const item = chartData.value[p.dataIndex];
					return `<div style="font-size:12px;">
						<div style="color:#666;">${item?.fullTime || p.axisValue}</div>
						<div style="font-weight:bold;margin-top:2px;">${currentParamMeta.value?.name}: ${p.data} ${unit}</div>
					</div>`;
				},
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '8%',
				top: '8%',
				containLabel: true,
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: times,
				axisLine: { lineStyle: { color: '#888' } },
				axisLabel: { fontSize: 11 },
			},
			yAxis: {
				type: 'value',
				axisLine: { show: false },
				splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
				axisLabel: {
					formatter: `{value} ${unit}`,
					fontSize: 11,
				},
			},
			series: [
				{
					name: currentParamMeta.value?.name,
					type: 'line',
					smooth: true,
					showSymbol: vals.length < 20,
					symbolSize: 6,
					data: vals,
					lineStyle: {
						width: 2.5,
						color: '#059669',
					},
					itemStyle: {
						color: '#059669',
					},
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(5, 150, 105, 0.25)' },
							{ offset: 1, color: 'rgba(5, 150, 105, 0.01)' },
						]),
					},
				},
			],
		};

		chartInstance.setOption(option, true);
	}

	watch([() => props.deviceId, selectedRange, selectedParamKey], () => {
		loadTelemetry();
	});

	onMounted(() => {
		loadTelemetry();
		window.addEventListener('resize', handleResize);
	});

	onUnmounted(() => {
		window.removeEventListener('resize', handleResize);
		if (chartInstance) {
			chartInstance.dispose();
			chartInstance = null;
		}
	});

	function handleResize() {
		if (chartInstance) {
			chartInstance.resize();
		}
	}
</script>

