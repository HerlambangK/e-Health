<template>
  <div
    class="md:ml-72 pb-10 flex-grow items-center justify-center bg-white rounded-md shadow-md px-4 border mx-11"
  >
    <button @click="toggleWeekends">Toggle Weekends</button>
    <FullCalendar
      :options="calendarOptions"
      @eventClick="handleEventClick"
      @eventDrop="handleEventDrop"
    />
    <!-- <div v-if="selectedEvent" class="popup">
      <h3>{{ selectedEvent.title }}</h3>
      <p>Start: {{ selectedEvent.start.toLocaleString() }}</p>
      <p>End: {{ selectedEvent.end.toLocaleString() }}</p>
    </div> -->
  </div>
</template>

<script>
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    FullCalendar,
  },
  setup() {
    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      weekends: true,
      events: [
        { title: "Sample Event", start: "2023-12-01", end: "2023-12-05" },
        { title: "Sample Event", start: "2023-12-01", end: "2023-12-05" },
        { title: "Sample Event", start: "2023-12-01", end: "2023-12-05" },
        // Add more events as needed
      ],
    });

    const toggleWeekends = () => {
      calendarOptions.value.weekends = !calendarOptions.value.weekends;
    };

    const handleEventClick = (eventInfo) => {
      // Handle event click if needed
      console.log("Event Clicked:", eventInfo.event.title);
    };

    const handleEventDrop = (eventDropInfo) => {
      // Handle event drop if needed
      console.log("Event Dropped:", eventDropInfo.event.title);
    };

    return {
      calendarOptions,
      toggleWeekends,
      handleEventClick,
      handleEventDrop,
    };
  },
};
</script>
