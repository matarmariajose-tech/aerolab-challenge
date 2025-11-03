import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerolab Games Collection",
  description: "Collect and discover your favorite video games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}