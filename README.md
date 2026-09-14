This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Shared tab titles

On Netlify, `netlify/edge-functions/shared-title.ts` puts the URL's `title` parameter
into the initial HTML response. This makes the tab title available as soon as the
browser parses the title tag, including when JavaScript is delayed or disabled.
The site still builds as a static export in `out/`; deploy the repository with
`netlify.toml` so the edge function is included.

An inline head script keeps the title synchronized during hydration and history
navigation. It has no timeout and follows title edits and resets through the URL.
When serving only `out/` on another static host, the title needs this inline script;
the initial response there still contains the default title. No site can set a
tab's label before the browser receives its response.

This uses Netlify's documented [response transformation API](https://docs.netlify.com/build/edge-functions/api/#modify-a-response).

## Verification

```bash
bun install --frozen-lockfile
bun run lint
bun run test
bunx playwright install chromium --only-shell
bun run test:e2e
```

Browser tests use the production export and actual edge handler locally, covering
disabled or delayed JavaScript, edits, resets, reloads, history, and title escaping.
Netlify deployment behavior still needs a check after deployment.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
