/**
 * Monotonic in-flight ticket guard against out-of-order responses.
 *
 * Call `next()` when a request starts and check the returned function inside the
 * subscribe callback — it stays true only while that request is the most recent
 * one, so a slow, superseded response can never overwrite a fresher result.
 */
export class LatestOnly {
  private ticket = 0;

  next(): () => boolean {
    const mine = ++this.ticket;
    return () => mine === this.ticket;
  }
}
