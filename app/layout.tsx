import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MultiChain Sniper Pro - Advanced Crypto Trading Platform",
  description:
    "Multi-chain cryptocurrency trading platform with autonomous Telegram bot, real-time sniping, copy trading, and advanced portfolio management.",
  keywords: "crypto, trading, telegram bot, multi-chain, ethereum, solana, defi, sniping, copy trading",
  authors: [{ name: "MultiChain Sniper Pro Team" }],
  openGraph: {
    title: "MultiChain Sniper Pro",
    description: "Advanced multi-chain crypto trading with autonomous Telegram bot",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MultiChain Sniper Pro",
    description: "Advanced multi-chain crypto trading platform",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">{children}</div>
      </body>
    </html>
  )
}
