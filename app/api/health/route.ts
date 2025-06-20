import { NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"

async function checkTelegramAPI() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      return { status: "error", message: `HTTP ${response.status}` }
    }

    const data = await response.json()

    if (data.ok) {
      return {
        status: "healthy",
        bot_username: data.result.username,
        bot_id: data.result.id,
      }
    } else {
      return { status: "error", message: data.description }
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  // Check Telegram API
  const telegramCheck = await checkTelegramAPI()

  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    response_time: Date.now() - startTime,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",

    // System metrics
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: {
        usage: process.cpuUsage(),
      },
      node_version: process.version,
      platform: process.platform,
    },

    // Service checks
    services: {
      telegram_bot: {
        status: telegramCheck.status,
        bot_token_configured: !!BOT_TOKEN,
        bot_username: telegramCheck.bot_username || null,
        bot_id: telegramCheck.bot_id || null,
        error: telegramCheck.status === "error" ? telegramCheck.message : null,
      },
      webhook: {
        status: process.env.WEBHOOK_URL ? "configured" : "missing",
        url: process.env.WEBHOOK_URL || null,
        secret_configured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      },
      database: {
        status: process.env.DATABASE_URL ? "configured" : "missing",
        url_configured: !!process.env.DATABASE_URL,
      },
      api_endpoints: {
        webhook: "/api/telegram/webhook",
        setup: "/api/telegram/setup",
        health: "/api/health",
      },
    },

    // Configuration status
    configuration: {
      required_env_vars: {
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_WEBHOOK_SECRET: !!process.env.TELEGRAM_WEBHOOK_SECRET,
        WEBHOOK_URL: !!process.env.WEBHOOK_URL,
        DATABASE_URL: !!process.env.DATABASE_URL,
      },
      optional_env_vars: {
        ADMIN_CHAT_ID: !!process.env.ADMIN_CHAT_ID,
        ADMIN_API_KEY: !!process.env.ADMIN_API_KEY,
      },
    },
  }

  // Determine overall health status
  const criticalServices = [
    health.services.telegram_bot.status === "healthy",
    health.services.webhook.status === "configured",
  ]

  if (criticalServices.some((service) => !service)) {
    health.status = "degraded"
  }

  if (telegramCheck.status === "error") {
    health.status = "unhealthy"
  }

  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
