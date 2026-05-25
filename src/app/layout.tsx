import type { Metadata } from "next";
// import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// const playfair = Playfair_Display({
//   subsets: ["latin"],
//   variable: "--font-display",
// });

// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// const jetbrainsMono = JetBrains_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
// });

export const metadata: Metadata = {
  title: "DIARRABA | Gestion Premium",
  description: "Système de gestion moderne pour ferme avicole",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
