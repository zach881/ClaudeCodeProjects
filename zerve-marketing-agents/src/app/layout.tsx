import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Zerve Marketing Agents",
  description: "Internal AI marketing agents for Zerve — SEO & content strategy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <Nav />
          <main className="flex-1 py-6">{children}</main>
          <footer className="border-t border-edge py-4 text-center text-xs text-muted">
            Zerve Marketing Agents · powered by Claude · internal tool
          </footer>
        </div>
      </body>
    </html>
  );
}
