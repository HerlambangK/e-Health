interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useApiCache<T>(url: string | (() => string), opts: { ttl?: number; immediate?: boolean } = {}) {
  const { ttl = 30_000, immediate = true } = opts;
  const data = ref<T | null>(null);
  const pending = ref(false);
  const error = ref<Error | null>(null);

  async function refresh(force = false) {
    const key = typeof url === 'function' ? url() : url;
    const cached = cache.get(key);
    
    if (!force && cached && Date.now() - cached.timestamp < ttl) {
      data.value = cached.data;
      return;
    }

    // Stale-while-revalidate: show stale data immediately
    if (cached) data.value = cached.data;

    pending.value = true;
    try {
      const result = await $fetch<{ data: T }>(key);
      data.value = result.data;
      cache.set(key, { data: result.data, timestamp: Date.now() });
    } catch (e: any) {
      error.value = e;
    } finally {
      pending.value = false;
    }
  }

  function invalidate(pattern?: string) {
    if (pattern) {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
      }
    } else {
      const key = typeof url === 'function' ? url() : url;
      cache.delete(key);
    }
  }

  if (immediate) refresh();

  return { data, pending, error, refresh, invalidate };
}
