export async function submitKlaim(data: any): Promise<any> {
  const config = useRuntimeConfig();
  if (!config.bpjs?.vClaimUrl || !config.bpjs?.consId) {
    throw new Error('BPJS VClaim credentials not configured');
  }

  return $fetch(`${config.bpjs.vClaimUrl.replace(/\/$/, '')}/klaim/insert`, {
    method: "POST",
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
    body: JSON.stringify(data),
    timeout: 10000,
  });
}
