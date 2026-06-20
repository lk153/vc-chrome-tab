/**
 * Runs once when the server process boots, before any request or DB connection.
 *
 * This Atlas cluster rejects Node's TLS 1.3 handshake (it replies with an
 * internal_error alert), which breaks every MongoDB connection on Vercel's
 * runtime. Cap outbound TLS at 1.2 at boot — the equivalent of running node with
 * --tls-max-v1.2. TLS 1.2 to Atlas is fully supported and secure.
 *
 * Webpack does not externalize Node built-ins in the instrumentation bundle, so
 * we reach the real `tls` module via a runtime require it can't statically see.
 */
export function register(): void {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const nodeRequire = eval("require") as (id: string) => { DEFAULT_MAX_VERSION: string };
    nodeRequire("tls").DEFAULT_MAX_VERSION = "TLSv1.2";
  }
}
