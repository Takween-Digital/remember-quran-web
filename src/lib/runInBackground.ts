/**
 * Runs a promise "in the background" after a response has already been
 * decided — for work a request shouldn't wait on (e.g. sending a
 * notification email) but that still needs to actually finish.
 *
 * On Cloudflare Workers, a plain fire-and-forget promise (`void p.catch(...)`)
 * is not safe: the runtime is free to terminate the whole execution context
 * as soon as the response is returned, silently killing any in-flight async
 * work — including, in this app's case, the SMTP connection for a welcome
 * email that had barely started. `ExecutionContext.waitUntil()` is the
 * Workers API that extends the request's lifetime specifically for this.
 *
 * Falls back to a plain fire-and-forget when not running on Workers (e.g.
 * local `next dev`), where no such termination risk exists.
 */
export async function runInBackground(promise: Promise<unknown>): Promise<void> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare")
    const { ctx } = await getCloudflareContext({ async: true })
    ctx.waitUntil(promise.catch((err) => console.error("Background task failed", err)))
  } catch {
    void promise.catch((err) => console.error("Background task failed", err))
  }
}
