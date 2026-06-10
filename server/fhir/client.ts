interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getSatuSehatToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const config = useRuntimeConfig();
  const baseUrl = config.satusehat?.baseUrl as string;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.satusehat?.clientId as string,
    client_secret: config.satusehat?.clientSecret as string,
  });

  const response = await $fetch<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }>(`${baseUrl}/oauth2/v1/accesstoken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  tokenCache = {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

export async function satusehatFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getSatuSehatToken();
  const config = useRuntimeConfig();
  const baseUrl = config.satusehat?.baseUrl as string;

  return $fetch<T>(`${baseUrl}/fhir-r4/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
