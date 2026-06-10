export async function getPesertaBPJS(noBPJS: string): Promise<any> {
  const config = useRuntimeConfig();
  return $fetch(`${config.bpjs?.pCareUrl}/peserta/noKartu/${noBPJS}`, {
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
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
  return $fetch(`${config.bpjs?.vClaimUrl}/SEP/1.1/insert`, {
    method: "POST",
    headers: {
      "X-cons-id": config.bpjs?.consId as string,
      "X-secret-key": config.bpjs?.secretKey as string,
      "X-user-key": config.bpjs?.userKey as string,
    },
    body: JSON.stringify({ request: { t_sep: data } }),
  });
}
