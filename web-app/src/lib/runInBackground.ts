/**
 * Runs a promise "in the background" after a response has already been
 * decided — for work a request shouldn't wait on (e.g. sending a
 * notification email) but that still needs to actually finish.
 *
 * On Node.js, fire-and-forget promises are handled by the runtime's event loop
 * which keeps the process alive for pending async work.
 */
export function runInBackground(promise: Promise<unknown>): void {
  void promise.catch((err) => console.error("Background task failed", err));
}
