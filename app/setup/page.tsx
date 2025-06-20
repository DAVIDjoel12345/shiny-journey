"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Bot, Webhook, Settings, CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface BotStatus {
  bot_running: boolean
  webhook_set: boolean
  bot_info: {
    id: number
    username: string
    first_name: string
  } | null
  webhook_info: {
    url: string
    pending_update_count: number
  } | null
  configuration: {
    bot_token_present: boolean
    webhook_secret_present: boolean
    bot_token_prefix: string
  }
  suggested_webhook_url: string
  health: string
  timestamp: string
}

export default function SetupPage() {
  const [status, setStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/telegram/setup")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStatus(data)
      console.log("📊 Bot status:", data)
    } catch (error) {
      console.error("Failed to fetch status:", error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string, description: string) => {
    setActionLoading(true)
    setLastAction(description)

    try {
      console.log(`🔧 Performing action: ${action}`)

      const response = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()
      console.log(`✅ Action result:`, result)

      if (result.success) {
        // Wait a moment then refresh status
        setTimeout(fetchStatus, 2000)
      } else {
        console.error(`❌ Action failed:`, result.error)
      }
    } catch (error) {
      console.error(`❌ Action error:`, error)
    } finally {
      setActionLoading(false)
      setLastAction(null)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (isHealthy: boolean, label: string) => {
    if (isHealthy) {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          {label}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-600 text-white">
          <XCircle className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )
    }
  }

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading bot status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Bot className="h-10 w-10" />
            MultiChain Sniper Pro Setup
          </h1>
          <p className="text-gray-300 text-lg">Configure and monitor your autonomous trading bot</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <Bot className="h-5 w-5" />
                Bot Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-3">
                  {getStatusBadge(status.bot_running, "Online")}
                  {status.bot_info && (
                    <div className="text-sm text-gray-300">
                      <p>
                        <strong>@{status.bot_info.username}</strong>
                      </p>
                      <p>ID: {status.bot_info.id}</p>
                    </div>
                  )}
                </div>
              ) : (
                <Badge className="bg-gray-600 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unknown
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <Webhook className="h-5 w-5" />
                Webhook
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-3">
                  {getStatusBadge(status.webhook_set, "Active")}
                  {status.webhook_info && (
                    <div className="text-xs text-gray-400 break-all">{status.webhook_info.url}</div>
                  )}
                </div>
              ) : (
                <Badge className="bg-gray-600 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unknown
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bot Token:</span>
                    {status.configuration.bot_token_present ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Webhook Secret:</span>
                    {status.configuration.webhook_secret_present ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Configuration unknown</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Bot Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              {actionLoading && lastAction ? `${lastAction}...` : "Configure and control your trading bot"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => performAction("setup", "Setting up webhook")}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Webhook className="h-4 w-4 mr-2" />
                )}
                Setup Webhook
              </Button>

              <Button
                onClick={() => performAction("restart", "Restarting bot")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                Restart Bot
              </Button>

              <Button
                onClick={fetchStatus}
                disabled={loading}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>

              <Button
                onClick={() => window.open("/api/health", "_blank")}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Health Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        {status && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bot Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Bot Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {status.bot_info ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Username:</span>
                      <span className="text-white font-mono">@{status.bot_info.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Bot ID:</span>
                      <span className="text-white font-mono">{status.bot_info.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Name:</span>
                      <span className="text-white">{status.bot_info.first_name}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Bot information not available</p>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-300">Token:</span>
                  <span className="text-white font-mono">{status.configuration.bot_token_prefix}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Health:</span>
                  <Badge className={status.health === "healthy" ? "bg-green-600" : "bg-red-600"}>{status.health}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-300">Status:</span>
                  {getStatusBadge(status.webhook_set, "Configured")}
                </div>

                {status.webhook_info && (
                  <>
                    <div>
                      <span className="text-gray-300 block mb-1">Current URL:</span>
                      <div className="bg-slate-900 p-2 rounded text-xs text-gray-300 font-mono break-all">
                        {status.webhook_info.url}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Pending Updates:</span>
                      <span className="text-white">{status.webhook_info.pending_update_count}</span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-gray-300 block mb-1">Suggested URL:</span>
                  <div className="bg-slate-900 p-2 rounded text-xs text-gray-300 font-mono break-all">
                    {status.suggested_webhook_url}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🚀 Getting Started</CardTitle>
            <CardDescription className="text-gray-400">
              Follow these steps to get your bot up and running
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Setup Steps</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-white font-medium">Configure Webhook</p>
                      <p className="text-gray-400 text-sm">Click "Setup Webhook" to configure the bot's endpoint</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-white font-medium">Test the Bot</p>
                      <p className="text-gray-400 text-sm">
                        Send <code className="bg-slate-700 px-1 rounded">/start</code> to your bot on Telegram
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-white font-medium">Connect Wallet</p>
                      <p className="text-gray-400 text-sm">
                        Use <code className="bg-slate-700 px-1 rounded">/wallet</code> to connect your trading wallet
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="text-white font-medium">Start Trading</p>
                      <p className="text-gray-400 text-sm">
                        Use commands like <code className="bg-slate-700 px-1 rounded">/buy PEPE 0.1 eth</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Essential Commands</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded">/start</code>
                    <span className="text-gray-400">Initialize bot</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-green-400 bg-slate-900 px-2 py-1 rounded">/help</code>
                    <span className="text-gray-400">Show all commands</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-purple-400 bg-slate-900 px-2 py-1 rounded">/wallet</code>
                    <span className="text-gray-400">Connect wallet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-yellow-400 bg-slate-900 px-2 py-1 rounded">/trade</code>
                    <span className="text-gray-400">Trading dashboard</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-orange-400 bg-slate-900 px-2 py-1 rounded">/price BTC</code>
                    <span className="text-gray-400">Check prices</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="text-cyan-400 bg-slate-900 px-2 py-1 rounded">/portfolio</code>
                    <span className="text-gray-400">View holdings</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href="/api/health"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  System Health
                </a>
                <a href="/" className="text-green-400 hover:text-green-300 flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Main Dashboard
                </a>
                <span className="text-gray-400">
                  Bot Token: {status?.configuration.bot_token_prefix || "Not configured"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Last updated: {status?.timestamp ? new Date(status.timestamp).toLocaleString() : "Never"}</p>
          <p className="mt-1">MultiChain Sniper Pro v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
