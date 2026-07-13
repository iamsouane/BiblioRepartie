"use client"

import useSWR from "swr"
import { useSite } from "@/components/site-provider"
import type { Api } from "@/lib/api"

// Generic SWR wrapper keyed by site + mode so data refreshes when either changes.
export function useResource<T>(
  key: string,
  fetcher: (api: Api) => Promise<T>,
  opts?: { enabled?: boolean },
) {
  const { api, site, mode } = useSite()
  const enabled = opts?.enabled ?? true
  const swrKey = enabled ? [key, site, mode] : null
  const { data, error, isLoading, mutate } = useSWR<T>(swrKey, () => fetcher(api), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })
  return { data, error: error as Error | undefined, isLoading, mutate }
}
