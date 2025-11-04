import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub - Collect Your Favorite Games",
  description: "Search and collect your favorite video games from IGDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-pink-400 to-purple-900 antialiased`}>
        <header className="bg-purple-900/80 backdrop-blur-sm border-b border-purple-700/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-purple-200 to-violet-300 bg-clip-text text-transparent">
                GameHub
              </span>
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}