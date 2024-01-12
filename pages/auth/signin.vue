<script lang="ts" setup>
import SigninSchema from "~/schemas/Signin.schema";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
// import { z } from "h3-zod";
import { z } from "zod";

const isLoading = ref(false);
const formState = reactive({
  email: undefined,
  password: undefined,
});

const validationSchema = SigninSchema;

const { signIn } = useAuth();
const router = useRouter();

async function handleSubmit(
  event: FormSubmitEvent<z.output<typeof validationSchema>>
) {
  console.log("object", event);
  console.log("event.data.email", event.data.email);
  try {
    isLoading.value = true;
    // ts-expect-error
    const res = await signIn("credentials", {
      email: event.data.email,
      password: event.data.password,
      redirect: false,
    });

    if (!res?.error) {
      useRouter().push("/dashboard");
    }
    // const { error } = await signIn("credentials", {
    //   email: event.data.email,
    //   password: event.data.password,
    //   redirect: false,
    // });

    // if (error) {
    //   throw new Error(error);
    // }

    router.push("/dashboard");
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
useHead({
  title: "Signin",
});
definePageMeta({
  layout: "home",
});

// const { formState, isLoading, validationSchema, handleSubmit } = useSignin();
</script>
<template>
  <WrapperAuth title="Sign In to your account">
    <template #header>
      <span class="text-sm mr-px">Don't have an account?</span>
      <NuxtLink to="/auth/signup" class="text-primary-500"> Sign Up </NuxtLink>
    </template>

    <UForm :state="formState" :schema="validationSchema" @submit="handleSubmit">
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
      <UFormGroup>
        <UButton :loading="isLoading" type="submit" color="primary" block>
          Sign In
        </UButton>
      </UFormGroup>
    </UForm>
  </WrapperAuth>
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
