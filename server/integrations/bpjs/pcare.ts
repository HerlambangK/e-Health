export async function getPesertaBPJS(noBPJS: string): Promise<any> {
  const config = useRuntimeConfig();
  if (!config.bpjs?.pCareUrl || !config.bpjs?.consId) {
    throw new Error('BPJS PCare credentials not configured');
  }

  return $fetch(`${config.bpjs.pCareUrl.replace(/\/$/, '')}/peserta/noKartu/${noBPJS}`, {
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
    timeout: 10000,
  });
}

export async function buatSEP(data: {
  noKartu: string;
  tglSep: string;
  tglRujukan?: string;
  noRujukan?: string;
  kdppk: string;
  diagnosa: string;
  poli: string;
  klasRawat: string;
}): Promise<any> {
  const config = useRuntimeConfig();
  if (!config.bpjs?.vClaimUrl || !config.bpjs?.consId) {
    throw new Error('BPJS VClaim credentials not configured');
  }

  return $fetch(`${config.bpjs.vClaimUrl.replace(/\/$/, '')}/SEP/1.1/insert`, {
    method: "POST",
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
    body: JSON.stringify({ request: { t_sep: data } }),
    timeout: 10000,
  });
}
