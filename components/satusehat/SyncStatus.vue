<template>
  <UTooltip :text="tooltipText">
    <UBadge :color="badgeColor" :label="badgeLabel" variant="soft" class="cursor-help">
      <template #leading>
        <UIcon :name="badgeIcon" class="w-3 h-3" />
      </template>
    </UBadge>
  </UTooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: "pending" | "sent" | "success" | "failed" | "not_required";
  lastSync?: Date;
  error?: string;
}>();

const badgeColor = computed(() =>
  ({
    pending: "yellow",
    sent: "blue",
    success: "green",
    failed: "red",
    not_required: "gray",
  }[props.status])
);

const badgeLabel = computed(() =>
  ({
    pending: "Menunggu Sync",
    sent: "Dikirim",
    success: "Tersync",
    failed: "Gagal",
    not_required: "N/A",
  }[props.status])
);

const badgeIcon = computed(() =>
  ({
    pending: "i-heroicons-clock",
    sent: "i-heroicons-arrow-up-circle",
    success: "i-heroicons-check-circle",
    failed: "i-heroicons-x-circle",
    not_required: "i-heroicons-minus",
  }[props.status])
);

const tooltipText = computed(() => {
  if (props.status === "failed" && props.error) return `Gagal: ${props.error}`;
  if (props.status === "success" && props.lastSync) {
    return `Tersync: ${new Date(props.lastSync).toLocaleString("id-ID")}`;
  }
  return `Status SatuSehat: ${badgeLabel.value}`;
});
</script>
