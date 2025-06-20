import { type NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

async function makeApiCall(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function getBotInfo() {
  return await makeApiCall("getMe")
}

async function getWebhookInfo() {
  return await makeApiCall("getWebhookInfo")
}

async function setWebhook(webhookUrl: string) {
  return await makeApiCall("setWebhook", {
    method: "POST",
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: WEBHOOK_SECRET,
      allowed_updates: ["message", "callback_query"],
      max_connections: 100,
      drop_pending_updates: true,
    }),
  })
}

async function deleteWebhook() {
  return await makeApiCall("deleteWebhook", {
    method: "POST",
  })
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking bot status...")

    const [botResult, webhookResult] = await Promise.all([getBotInfo(), getWebhookInfo()])

    const status = {
      timestamp: new Date().toISOString(),
      bot_running: botResult.success,
      bot_info: botResult.success ? botResult.data.result : null,
      bot_error: botResult.success ? null : botResult.error,
      webhook_info: webhookResult.success ? webhookResult.data.result : null,
      webhook_error: webhookResult.success ? null : webhookResult.error,
      webhook_set: webhookResult.success && webhookResult.data.result.url ? true : false,
      configuration: {
        bot_token_present: !!BOT_TOKEN,
        webhook_secret_present: !!WEBHOOK_SECRET,
        bot_token_prefix: BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + "..." : "missing",
      },
      suggested_webhook_url: `${request.nextUrl.origin}/api/telegram/webhook`,
      health: botResult.success ? "healthy" : "unhealthy",
    }

    console.log("📊 Bot status:", {
      running: status.bot_running,
      webhook_set: status.webhook_set,
      bot_username: status.bot_info?.username,
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Status check failed:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        bot_running: false,
        error: error instanceof Error ? error.message : "Status check failed",
        health: "error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, webhook_url } = body

    console.log(`🔧 Processing action: ${action}`)

    switch (action) {
      case "setup":
      case "start":
      case "set_webhook": {
        const webhookUrl = webhook_url || `${request.nextUrl.origin}/api/telegram/webhook`
        console.log(`🔗 Setting webhook to: ${webhookUrl}`)

        const result = await setWebhook(webhookUrl)

        if (result.success) {
          console.log("✅ Webhook set successfully")

          // Also get updated bot info
          const botInfo = await getBotInfo()

          return NextResponse.json({
            success: true,
            message: "Webhook configured successfully",
            webhook_url: webhookUrl,
            webhook_result: result.data,
            bot_info: botInfo.success ? botInfo.data.result : null,
            timestamp: new Date().toISOString(),
          })
        } else {
          console.error("❌ Webhook setup failed:", result.error)

          return NextResponse.json(
            {
              success: false,
              message: "Failed to set webhook",
              error: result.error,
              timestamp: new Date().toISOString(),
            },
            { status: 500 },
          )
        }
      }

      case "delete_webhook": {
        console.log("🗑️ Deleting webhook...")

        const result = await deleteWebhook()

        return NextResponse.json({
          success: result.success,
          message: result.success ? "Webhook deleted successfully" : "Failed to delete webhook",
          error: result.success ? null : result.error,
          timestamp: new Date().toISOString(),
        })
      }

      case "restart": {
        console.log("🔄 Restarting bot (re-setting webhook)...")

        const webhookUrl = `${request.nextUrl.origin}/api/telegram/webhook`
        const result = await setWebhook(webhookUrl)

        return NextResponse.json({
          success: result.success,
          message: result.success ? "Bot restarted successfully" : "Failed to restart bot",
          webhook_url: webhookUrl,
          error: result.success ? null : result.error,
          timestamp: new Date().toISOString(),
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
            valid_actions: ["setup", "start", "set_webhook", "delete_webhook", "restart"],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Setup action failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Setup action failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
