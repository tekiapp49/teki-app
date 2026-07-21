import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "TéKi — Ta commune, à portée de main",
  description:
    "TéKi connecte habitants, commerçants, artisans et associations d'un territoire rural. Gratuit pour les habitants.",
};

export const viewport = {
  themeColor: "#2F5233",
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
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
