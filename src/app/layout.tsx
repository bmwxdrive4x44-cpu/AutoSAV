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
  title: "AutoSAV - Marketplace de Sourcing International",
  description: "Trouvez des produits uniques via des agents acheteurs vérifiés dans le monde entier. La plateforme de confiance pour le sourcing international.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080c15",
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

