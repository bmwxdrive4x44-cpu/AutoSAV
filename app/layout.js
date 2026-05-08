import "./globals.css";

export const metadata = {
  title: "AutoSAV MVP",
  description: "Automotive parts marketplace MVP for Algeria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
