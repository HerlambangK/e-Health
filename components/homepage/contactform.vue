<template>
  <div class="bg-white pt-2 dark:bg-gray-900 px-6 pt-14 lg:px-8" id="contact">
    <div class="mx-auto max-w-2xl py-12 sm:py-48 lg:py-12">
      <h5
        class="inline-flex items-center text-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
      >
        <svg
          class="w-4 h-4 me-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 16"
        >
          <path
            d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"
          />
          <path
            d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"
          /></svg
        >Contact us
      </h5>

      <form class="mb-6">
        <div class="mb-6">
          <label
            for="email"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Your email</label
          >
          <input
            type="email"
            id="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
            placeholder="name@company.com"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="subject"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Subject</label
          >
          <input
            type="text"
            id="subject"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
            placeholder="Let us know how we can help you"
            required
          />
        </div>
        <div class="mb-6">
          <label
            for="message"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Your message</label
          >
          <textarea
            id="message"
            rows="4"
            class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
            placeholder="Your message..."
          ></textarea>
        </div>
        <button
          type="submit"
          class="text-white bg-green-700 hover:bg-green-800 w-full focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800 block"
        >
          Send message
        </button>
      </form>
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
        <a href="#" class="hover:underline">info@company.com</a>
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <a href="#" class="hover:underline">212-456-7890</a>
      </p>
    </div>
  </div>
</template>

<script setup></script>

<style></style>
