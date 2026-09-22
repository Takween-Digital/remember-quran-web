import type { OpenNextConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue"

/**
 * Cache config: ISR pages/fetches persist to R2 (`NEXT_INC_CACHE_R2_BUCKET`) instead of
 * "dummy", which never cached anything and forced a full SSR render + refetch of the
 * external Quran APIs on *every* request — the main cause of Worker CPU-limit (1102) errors.
 *
 * tagCache stays "dummy": the app never calls revalidateTag/revalidatePath, and
 * time-based `export const revalidate` staleness is checked by Next core against
 * `lastModified`, independent of the tag cache.
 */
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: () => r2IncrementalCache,
      tagCache: "dummy",
      queue: () => memoryQueue,
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
}

export default config
