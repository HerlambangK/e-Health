import { satusehatFetch } from "~/server/fhir/client";

export default defineEventHandler(async () => {
  try {
    const result = await satusehatFetch("/metadata");
    return { data: { connected: true, result } };
  } catch (error: any) {
    return {
      data: {
        connected: false,
        error: error.message,
      },
    };
  }
});
