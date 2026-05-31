import type { Metadata } from "next";
import "./globals.css";
import { DOMCleaner } from "@/components/DOMCleaner";

export const metadata: Metadata = {
  title: "DIARRABA | Gestion Premium",
  description: "Système de gestion moderne",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <DOMCleaner />
        {children}
      </body>
    </html>
  );
}
