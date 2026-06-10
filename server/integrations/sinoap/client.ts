export async function sinoAPFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = useRuntimeConfig();

  return $fetch<T>(`${config.sinoap?.baseUrl}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${config.sinoap?.apiKey}`,
      "X-Facility-ID": config.sinoap?.facilityId as string,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
}
