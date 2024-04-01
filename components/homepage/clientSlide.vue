<template>
  <div class="overflow-hidden relative">
    <div class="slider" ref="slider">
      <div
        class="slides"
        :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="slide mx-auto mt-10 grid max-w-lg grid-cols-3 md:grid-cols-4 items-center gap-x-8 gap-y-10 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5"
        >
          <img :src="item.image" :alt="item.alt" class="w-full" />
        </div>
      </div>
    </div>
    <button
      @click="prevSlide"
      class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white py-2 px-4 rounded-l-md"
    >
      Prev
    </button>
    <button
      @click="nextSlide"
      class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white py-2 px-4 rounded-r-md"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentSlide: 0,
      slideWidth: 0,
      items: [
        { image: "/img/logo.png", alt: "Slide 1" },
        { image: "/img/logo.png", alt: "Slide 2" },
        { image: "/img/logo.png", alt: "Slide 3" },
        // Add more slides as needed
      ],
    };
  },
  mounted() {
    this.slideWidth = this.$refs.slider.offsetWidth;
  },
  methods: {
    nextSlide() {
      if (this.currentSlide < this.items.length - 1) {
        this.currentSlide++;
      }
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      }
    },
  },
};
</script>

<style>
.slider {
  transition: transform 0.3s ease;
}
.slides {
  display: flex;
}
.slide {
  flex: 0 0 auto;
}
</style>
