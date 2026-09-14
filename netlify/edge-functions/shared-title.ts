import type { Context } from "@netlify/edge-functions";

export default async function sharedTitle(request: Request, context: Context) {
  const title = new URL(request.url).searchParams.get("title");
  if (request.method !== "GET" || title === null) return;

  const response = await context.next();
  if (
    response.status !== 200 ||
    !response.headers.get("content-type")?.toLowerCase().includes("text/html")
  ) {
    return response;
  }

  // Only replace the real title tag, not the static UI or React's payload.
  // Escape user input as HTML text, and use a callback so $& stays literal.
  const escapedTitle = title
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const html = (await response.text()).replace(
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    () => `<title>${escapedTitle}</title>`,
  );

  const headers = new Headers(response.headers);
  // The body differs from the cached static asset and is specific to this URL.
  for (const name of [
    "content-length",
    "content-encoding",
    "etag",
    "last-modified",
  ]) {
    headers.delete(name);
  }
  headers.set("Cache-Control", "no-store");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Netlify-CDN-Cache-Control", "no-store");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
