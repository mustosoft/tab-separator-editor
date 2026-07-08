import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";

const applySharedTitleScript = `
(() => {
  try {
    const title = new URLSearchParams(window.location.search).get("title");
    if (!title) return;

    const applyTitle = () => {
      if (document.title !== title) document.title = title;
    };

    applyTitle();

    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 3000);
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "Page Icon Editor",
  description: "Customize your page title and create a dynamic favicon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="antialiased">
        <script
          id="apply-shared-title"
          dangerouslySetInnerHTML={{ __html: applySharedTitleScript }}
        />
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
