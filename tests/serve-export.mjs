import { resolve, sep } from "node:path";
import sharedTitle from "../netlify/edge-functions/shared-title.ts";

const root = resolve("out");

// Exercise the production export and the real handler with Netlify's next()
// contract. The second port serves the plain static fallback for comparison.
for (const [port, useEdge] of [
  [4173, true],
  [4174, false],
]) {
  Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
      const url = new URL(request.url);
      const filePath = resolve(
        root,
        `.${url.pathname === "/" ? "/index.html" : url.pathname}`,
      );
      if (!filePath.startsWith(`${root}${sep}`))
        return new Response(null, { status: 403 });
      const next = async () => {
        const file = Bun.file(filePath);
        return (await file.exists())
          ? new Response(file)
          : new Response(null, { status: 404 });
      };
      if (useEdge && ["/", "/index.html"].includes(url.pathname)) {
        return (await sharedTitle(request, { next })) ?? next();
      }
      return next();
    },
  });
}
