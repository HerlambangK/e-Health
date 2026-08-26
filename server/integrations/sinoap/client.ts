export async function sinoAPFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = useRuntimeConfig();
  if (!config.sinoap?.baseUrl || !config.sinoap?.apiKey) {
    throw new Error('SINOAP API credentials not configured');
  }

  return $fetch<T>(`${config.sinoap.baseUrl.replace(/\/$/, '')}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${config.sinoap?.apiKey}`,
      "X-Facility-ID": config.sinoap?.facilityId as string,
      "Content-Type": "application/json",
      ...options.headers,
    },
    timeout: 10000,
    ...options,
  });
}
