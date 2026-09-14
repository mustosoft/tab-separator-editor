import type { Metadata } from "next";
import { DEFAULT_TITLE, applySharedTitleScript } from "@/lib/page-title";
import "./globals.css";
import ClientBody from "./ClientBody";

export const metadata: Metadata = {
  description: "Customize your page title and create a dynamic favicon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* The edge handler and inline script own this query-dependent title. */}
        <title suppressHydrationWarning>{DEFAULT_TITLE}</title>
        <script
          id="apply-shared-title"
          dangerouslySetInnerHTML={{ __html: applySharedTitleScript }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
