import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aerolab-challenge-m783p7wrl-maria-jose-s-projects-4d5aca07.vercel.app';

export const metadata: Metadata = {
  title: {
    default: "GameHub - Collect Your Favorite Games",
    template: "%s | GameHub"
  },
  description: "Search and collect your favorite video games from IGDB. Discover 500,000+ games with advanced search and build your personal collection.",
  keywords: ["games", "video games", "collection", "IGDB", "gaming"],

  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "GameHub",
    title: "GameHub - Discover & Collect Games",
    description: "Search through 500,000+ video games and build your personal collection",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GameHub - Video Game Collection Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "GameHub - Discover & Collect Games",
    description: "Search through 500,000+ video games and build your personal collection",
    images: [`${baseUrl}/og-image.png`],
    creator: "@matarmariajose",
  },

  metadataBase: new URL(baseUrl),
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-pink-400 to-purple-900 antialiased`}>
        <header className="bg-background: linear-gradient backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-purple font-bold text-xl bg-gradient-to-r from-purple-200 to-violet-300 bg-clip-text text-transparent">
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