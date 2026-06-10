import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "AutoSAV - Voyagez, Rapportez, Gagnez",
  description: "La marketplace qui connecte les voyageurs avec ceux qui cherchent des produits du monde entier. Rentabilisez vos voyages en rapportant des colis.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2d64",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="bg-bg">
      <body className={`${manrope.variable} ${sora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

