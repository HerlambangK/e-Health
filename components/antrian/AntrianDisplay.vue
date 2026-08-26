<template>
  <div class="text-center space-y-4">
    <TransitionGroup name="list" tag="div" class="space-y-4">
      <div v-for="item in antrian" :key="item._id" class="p-6 rounded-xl shadow-sm border transition-all duration-300" :class="[bgClass(item.status), item.status === 'called' ? 'scale-105 border-blue-400 ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg' : 'border-gray-100 dark:border-gray-800']">
        <div class="flex flex-col items-center justify-center space-y-2">
          <div class="text-5xl font-black" :class="item.status === 'called' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-gray-900 dark:text-white'">
            {{ item.nomorAntrian }}
          </div>
          <div class="text-lg font-medium text-gray-700 dark:text-gray-200">{{ item.pasienId?.nama || 'Pasien Umum' }}</div>
          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {{ item.poliId?.nama || 'Poli' }}
          </div>
        </div>
      </div>
    </TransitionGroup>
    
    <div v-if="!antrian.length" class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
      <UIcon name="i-heroicons-user-group" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
      <p class="text-gray-500 dark:text-gray-400 font-medium">Belum ada antrian saat ini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSocket } from '~/composables/useSocket';

const props = defineProps<{
  antrian: any[];
  poliId?: string;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const { on, off, joinPoli, leavePoli } = useSocket();

function handleQueueUpdate() {
  emit('update');
}

onMounted(() => {
  if (props.poliId) joinPoli(props.poliId);
  on('queue_update', handleQueueUpdate);
  // Keep polling as fallback with longer interval (30s instead of 5s)
});

onUnmounted(() => {
  if (props.poliId) leavePoli(props.poliId);
  off('queue_update', handleQueueUpdate);
});

function bgClass(status: string) {
  const map: Record<string, string> = {
    waiting: "bg-yellow-50",
    called: "bg-blue-50",
    in_room: "bg-green-50",
  };
  return map[status] || "bg-gray-50";
}
</script>
