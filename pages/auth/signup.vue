<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import type { z } from "h3-zod";
import SignupSchema from "~/schemas/Signup.schema";

useHead({
  title: "Signup",
});

definePageMeta({
  layout: "home",
});

const formState = ref({
  name: undefined,
  email: undefined,
  password: undefined,
  passwordConfirm: undefined,
});

const isLoading = ref(false);
const toast = useToast();
const router = useRouter();
const REGISTER_SUCCESS_MESSAGE =
  "Akun berhasil dibuat. Kamu akan diarahkan ke halaman masuk.";

async function handleSubmit(
  event: FormSubmitEvent<z.output<typeof SignupSchema>>
) {
  try {
    isLoading.value = true;
    await $fetch("/api/auth/signup", {
      method: "POST",
      body: event.data,
    });
    toast.add({
      id: "register-success",
      title: "Registrasi berhasil",
      description: REGISTER_SUCCESS_MESSAGE,
      color: "green",
      icon: "i-heroicons-check-circle",
      timeout: 4000,
    });
    await router.push({
      name: "auth-signin",
    });
  } catch (error) {
    console.error("signup error", error);
    const message =
      (error as { statusMessage?: string })?.statusMessage ??
      "Terjadi kendala saat membuat akun, silakan coba lagi.";
    toast.add({
      id: "register-error",
      title: "Registrasi gagal",
      description: message,
      color: "red",
      icon: "i-heroicons-information-circle",
      timeout: 4000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <WrapperAuth title="Create an account for free">
    <template #header>
      <span class="text-sm mr-px">Already have an account?</span>
      <NuxtLink to="/auth/signin" class="text-primary-500"> Sign In </NuxtLink>
    </template>

    <UForm :state="formState" :schema="SignupSchema" @submit="handleSubmit">
      <UFormGroup class="mb-4" name="name" label="Name">
        <UInput v-model="formState.name" type="text" placeholder="John Doe" />
      </UFormGroup>

      <UFormGroup class="mb-4" name="email" label="Email">
        <UInput
          v-model="formState.email"
          type="email"
          placeholder="john@email.com"
        />
      </UFormGroup>
      <UFormGroup class="mb-4" name="password" label="Password">
        <UInput
          v-model="formState.password"
          type="password"
          placeholder="********"
        />
      </UFormGroup>
      <UFormGroup class="mb-4" name="passwordConfirm" label="Confirm Password">
        <UInput
          v-model="formState.passwordConfirm"
          type="password"
          placeholder="********"
        />
      </UFormGroup>
      <UFormGroup>
        <UButton :loading="isLoading" type="submit" color="primary" block>
          Sign Up
        </UButton>
      </UFormGroup>
    </UForm>
  </WrapperAuth>
</template>

<style></style>
