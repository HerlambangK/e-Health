export async function submitKlaim(data: any): Promise<any> {
  const config = useRuntimeConfig();
  return $fetch(`${config.bpjs?.vClaimUrl}/klaim/insert`, {
    method: "POST",
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
    body: JSON.stringify(data),
  });
}
