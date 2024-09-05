<script lang="ts" setup>
import SigninSchema from "~/schemas/Signin.schema";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "h3-zod";

const isLoading = ref(false);
const formState = reactive({
  email: undefined,
  password: undefined,
});

const validationSchema = SigninSchema;

const { signIn } = useAuth();
const router = useRouter();
const isOpen = ref(false)
const countDown = ref(10)

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

onMounted(() => {
  isOpen.value = true

  const interval = setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(interval);
      isOpen.value = false
    }
  }, 1000)
}),

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
  <UModal v-model="isOpen" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Trial Account
            </h3>
          </div>
          <div class="font-bold text-red-600">
            {{ `Close in ${countDown} seconds !` }}
          </div>

          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="isOpen = false" />
        </div>
      </template>
      <div class=" pb-3">
        <div class="text-md">
          Silahkan bila ingin mencoba login dengan akun yang tersedia:
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 ">
          <div class="font-bold">Username: <span
              class="text-primary-500 underline italic text-sm">deploy@gmail.com</span>
          </div>
          <div class="font-bold">Password: <span
              class="text-primary-500 underline italic text-sm">deploy@gmail.com</span>
          </div>
        </div>

        <div class="text-md mt-6">
          Atau anda dapat Melakukan Regristrasi:
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 ">
        </div>
        <UButton to="/auth/signup" size="2xs" variant="solid">Registrasi</UButton>


      </div>

      <Placeholder class="h-32" />
    </UCard>
  </UModal>
  <WrapperAuth title="Sign In to your account">
    <template #header>
      <span class="text-sm mr-px">Don't have an account?</span>
      <NuxtLink to="/auth/signup" class="text-primary-500"> Sign Up </NuxtLink>
    </template>

    <UForm :state="formState" :schema="validationSchema" @submit="handleSubmit">
      <UFormGroup class="mb-4" name="email" label="Email">
        <UInput v-model="formState.email" type="email" placeholder="john@email.com" />
      </UFormGroup>
      <UFormGroup class="mb-4" name="password" label="Password">
        <UInput v-model="formState.password" type="password" placeholder="********" />
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
