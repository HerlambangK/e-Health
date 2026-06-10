export default defineEventHandler(async () => {
  try {
    const { getSatuSehatToken } = await import("~/server/fhir/client");
    const token = await getSatuSehatToken();
    return { data: { hasToken: !!token, valid: true } };
  } catch (error: any) {
    return {
      data: {
        hasToken: false,
        valid: false,
        error: error.message,
      },
    };
  }
});
