<script lang="ts" setup>
import SigninSchema from "~/schemas/Signin.schema";
// import { z } from "h3-zod";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "h3-zod";

const isLoading = ref(false);
const formState = reactive({
  email: undefined,
  password: undefined,
});

const { signIn } = useAuth();
const router = useRouter();

async function handleSubmit(
  event: FormSubmitEvent<z.output<typeof SigninSchema>>
) {
  console.log("object");
  try {
    isLoading.value = true;

    // @ts-expect-error
    const { error } = await signIn("credentials", {
      redirect: false,
      email: event.data.email,
      password: event.data.password,
    });

    if (error) {
      throw new Error(error);
    }

    router.push("/");
  } catch (e) {
    console.log("error", e);
    useToast().add({
      id: "error",
      title: "Invalid credentials",
      color: "red",
      icon: "i-heroicons-information-circle",
      timeout: 3000,
    });
  } finally {
    isLoading.value = false;
  }
}

// import { useSignin } from "~/composables/useSignin";
definePageMeta({
  layout: "home",
});
// useHead({
//   title: "Signin",
// });

// const { formState, isLoading, validationSchema, handleSubmit } = useSignin();
</script>
<template>
  <div class="grid lg:grid-cols-2 h-screen bg-gray-100 dark:bg-gray-950">
    <div class="left place-self-center w-full px-8 md:px-16 lg:px-36 2xl:px-52">
      <div class="header text-center mb-6">
        <div class="flex justify-center">
          <Logo />
        </div>
        <h1 class="text-xl font-bold mt-4">Login to your account</h1>
      </div>
      <UCard class="mt-8">
        <!-- form -->
        <!-- :schema="SigninSchema" -->
        <UForm :state="{ formState }" @submit="handleSubmit">
          <UFormGroup class="mb-4" name="email" label="Email">
            <UInput v-model="formState.email" type="email" />
          </UFormGroup>
          <UFormGroup class="mb-4" name="password" label="Password">
            <UInput v-model="formState.password" type="text" />
          </UFormGroup>
          <UButton :loading="isLoading" type="submit" block>Signin</UButton>
        </UForm>
        <!-- ./form -->
      </UCard>
    </div>
    <div class="right hidden lg:block"></div>
  </div>
</template>

<style>
.right {
  background: linear-gradient(-45deg, #22c55e, #10b981, #84cc16, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
