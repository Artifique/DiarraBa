import type { Metadata } from "next";
import "./globals.css";
import { DOMCleaner } from "@/components/DOMCleaner";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "DIARRABA | Gestion Premium",
  description: "Système de gestion moderne",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DIARRABA",
  },
  icons: {
    apple: "/logo.jpeg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E05A10",
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
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
