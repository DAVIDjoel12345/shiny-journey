"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap, TrendingUp, Shield, Globe, Users } from "lucide-react"

interface BotStatus {
  bot_running: boolean
  bot_info?: {
    id: number
    username: string
    first_name: string
  }
  webhook_info?: {
    url: string
    pending_update_count: number
  }
  timestamp: string
}

export default function HomePage() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBotStatus()
  }, [])

  const fetchBotStatus = async () => {
    try {
      const response = await fetch("/api/telegram/setup")
      const data = await response.json()
      setBotStatus(data)
    } catch (error) {
      console.error("Failed to fetch bot status:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeBot = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      })
      const data = await response.json()
      setBotStatus(data)
    } catch (error) {
      console.error("Failed to initialize bot:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">MultiChain Sniper Pro</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Advanced multi-chain cryptocurrency trading platform with autonomous Telegram bot
          </p>
        </div>

        {/* Bot Status Card */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-6 w-6" />
              Telegram Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                Checking bot status...
              </div>
            ) : botStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={botStatus.bot_running ? "default" : "destructive"}>
                    {botStatus.bot_running ? "Online" : "Offline"}
                  </Badge>
                  {botStatus.bot_info && <span className="text-gray-300">@{botStatus.bot_info.username}</span>}
                </div>

                {botStatus.bot_info && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Bot ID:</span>
                      <span className="text-white ml-2">{botStatus.bot_info.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white ml-2">{botStatus.bot_info.first_name}</span>
                    </div>
                  </div>
                )}

                {botStatus.webhook_info && (
                  <div className="text-sm">
                    <span className="text-gray-400">Webhook:</span>
                    <span className="text-green-400 ml-2">Configured</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={initializeBot} disabled={loading} size="sm">
                    {loading ? "Initializing..." : "Reinitialize Bot"}
                  </Button>
                  <Button onClick={fetchBotStatus} variant="outline" size="sm">
                    Refresh Status
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">Bot status unavailable</p>
                <Button onClick={initializeBot} disabled={loading}>
                  {loading ? "Initializing..." : "Initialize Bot"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Real-Time Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Execute trades instantly via Telegram commands with real-time price feeds and market data.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Auto-Sniping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Automatically detect and buy new token launches with customizable parameters and risk management.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Copy Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Follow successful traders and automatically copy their trades with customizable position sizing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-purple-400" />
                Multi-Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Trade on Ethereum and Solana networks with unified portfolio management and cross-chain analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-red-400" />
                MEV Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Advanced security features including MEV protection, private mempools, and transaction simulation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="h-5 w-5 text-cyan-400" />
                Autonomous Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                24/7 autonomous operation with health monitoring, error recovery, and real-time notifications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-semibold text-white">Start the Bot</p>
                  <p>
                    Send <code className="bg-slate-700 px-2 py-1 rounded">/start</code> to the Telegram bot to get your
                    Chat ID
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-semibold text-white">Connect Wallet</p>
                  <p>
                    Use <code className="bg-slate-700 px-2 py-1 rounded">/wallet</code> command to connect MetaMask or
                    Phantom wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-semibold text-white">Start Trading</p>
                  <p>
                    Use commands like <code className="bg-slate-700 px-2 py-1 rounded">/buy PEPE 0.1 eth</code> to
                    execute trades
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-semibold text-white">Configure Features</p>
                  <p>
                    Set up auto-sniping with <code className="bg-slate-700 px-2 py-1 rounded">/snipe</code> and copy
                    trading with <code className="bg-slate-700 px-2 py-1 rounded">/copy</code>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>MultiChain Sniper Pro - Advanced Crypto Trading Platform</p>
          <p className="text-sm mt-2">Bot Token: 7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo</p>
        </div>
      </div>
    </div>
  )
}
