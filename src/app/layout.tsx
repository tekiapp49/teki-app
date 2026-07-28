import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Polices hébergées en local (sous-ensemble latin) — pas de dépendance
// réseau au build. Figtree est variable (300–900), Caprasimo en 400.
const figtree = localFont({
  src: "./fonts/figtree-latin.woff2",
  variable: "--font-figtree",
  display: "swap",
  weight: "300 900",
});

const caprasimo = localFont({
  src: "./fonts/caprasimo-latin.woff2",
  variable: "--font-caprasimo",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "TéKi — Ta commune, à portée de main",
  description:
    "TéKi connecte habitants, commerçants, artisans et associations d'un territoire rural. Gratuit pour les habitants.",
};

export const viewport = {
  themeColor: "#085d28",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`h-full antialiased ${figtree.variable} ${caprasimo.variable}`}
    >
      <body className="min-h-full flex flex-col bg-app text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
