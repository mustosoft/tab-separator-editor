import assert from "node:assert/strict";
import { test } from "node:test";
import sharedTitle from "../netlify/edge-functions/shared-title.ts";

const html =
  '<!doctype html><html><head><title>Page Icon Editor</title></head><body><input value="Page Icon Editor"/></body></html>';
const requestFor = (title) =>
  new Request(`https://example.com/?${new URLSearchParams({ title })}`);
const contextFor = (response) => ({ next: async () => response });

test("sets the response title before any browser scripts run, preserving the static UI", async () => {
  const response = await sharedTitle(
    requestFor("----------------------"),
    contextFor(
      new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
    ),
  );
  assert.equal(
    await response.text(),
    html.replace(
      "<title>Page Icon Editor</title>",
      "<title>----------------------</title>",
    ),
  );
});

test("escapes markup and preserves Unicode, quotes, ampersands, and replacement tokens", async () => {
  const title = '</title><script>alert("x")</script> & 日本語 🟠 $&';
  const response = await sharedTitle(
    requestFor(title),
    contextFor(
      new Response(html, { headers: { "content-type": "text/html" } }),
    ),
  );
  const result = await response.text();
  assert.ok(
    result.includes(
      '<title>&lt;/title&gt;&lt;script&gt;alert("x")&lt;/script&gt; &amp; 日本語 🟠 $&amp;</title>',
    ),
  );
  assert.equal(result.includes("<script>"), false);
});

test("preserves an explicitly empty title", async () => {
  const response = await sharedTitle(
    requestFor(""),
    contextFor(
      new Response(html, { headers: { "content-type": "text/html" } }),
    ),
  );
  assert.ok((await response.text()).includes("<title></title>"));
});

test("leaves requests without a title and non-GET requests in the request chain", async () => {
  const context = { next: () => assert.fail("must not fetch the asset") };
  assert.equal(
    await sharedTitle(new Request("https://example.com/"), context),
    undefined,
  );
  assert.equal(
    await sharedTitle(
      new Request(requestFor("Shared"), { method: "HEAD" }),
      context,
    ),
    undefined,
  );
  assert.equal(
    await sharedTitle(
      new Request(requestFor("Shared"), { method: "POST" }),
      context,
    ),
    undefined,
  );
});

test("does not transform errors, redirects, partial responses, or non-HTML", async () => {
  for (const [status, contentType] of [
    [404, "text/html"],
    [302, "text/html"],
    [206, "text/html"],
    [200, "text/x-component"],
  ]) {
    const original = new Response("original body", {
      status,
      headers: { "content-type": contentType },
    });
    const response = await sharedTitle(
      requestFor("Shared"),
      contextFor(original),
    );
    assert.equal(response, original);
    assert.equal(await response.text(), "original body");
  }
});

test("removes stale asset headers and prevents caching personalized HTML", async () => {
  const response = await sharedTitle(
    requestFor("Shared"),
    contextFor(
      new Response(html, {
        headers: {
          "content-type": "text/html",
          "content-length": "123",
          "content-encoding": "gzip",
          etag: '"static-asset"',
          "last-modified": "Mon, 14 Sep 2026 00:00:00 GMT",
          "cache-control": "public, max-age=3600",
          "x-custom-header": "preserved",
        },
      }),
    ),
  );
  for (const name of [
    "content-length",
    "content-encoding",
    "etag",
    "last-modified",
  ]) {
    assert.equal(response.headers.has(name), false);
  }
  for (const name of [
    "cache-control",
    "cdn-cache-control",
    "netlify-cdn-cache-control",
  ]) {
    assert.equal(response.headers.get(name), "no-store");
  }
  assert.equal(response.headers.get("x-custom-header"), "preserved");
});
