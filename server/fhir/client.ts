interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getSatuSehatToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const config = useRuntimeConfig();
  const baseUrl = config.satusehat?.baseUrl as string;
  const clientId = config.satusehat?.clientId as string;
  const clientSecret = config.satusehat?.clientSecret as string;

  if (!baseUrl || !clientId || !clientSecret) {
    // SatuSehat integration is not configured in .env; return null to prevent socket hang up
    return null;
  }

  try {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await $fetch<{
      access_token: string;
      expires_in: number;
      token_type: string;
    }>(`${baseUrl.replace(/\/$/, '')}/oauth2/v1/accesstoken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      timeout: 10000,
    });

    tokenCache = {
      accessToken: response.access_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    };

    return tokenCache.accessToken;
  } catch (err: any) {
    console.warn('[SatuSehat Auth] Failed to obtain access token:', err.message || err);
    return null;
  }
}

export async function satusehatFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const config = useRuntimeConfig();
  const baseUrl = config.satusehat?.baseUrl as string;
  if (!baseUrl) {
    return null;
  }

  const token = await getSatuSehatToken();
  if (!token) {
    return null;
  }

  try {
    return await $fetch<T>(`${baseUrl.replace(/\/$/, '')}/fhir-r4/v1${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: 15000,
    });
  } catch (err: any) {
    console.warn(`[SatuSehat FHIR] Request to ${path} failed:`, err.message || err);
    throw err;
  }
}
