import { type NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

// Get current webhook info
async function getWebhookInfo() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
    const result = await response.json()
    return result
  } catch (error) {
    console.error("Failed to get webhook info:", error)
    return { ok: false, error: error.message }
  }
}

// Set webhook
async function setWebhook(webhookUrl: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"],
        max_connections: 100,
        drop_pending_updates: true,
      }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Failed to set webhook:", error)
    return { ok: false, error: error.message }
  }
}

// Get bot info
async function getBotInfo() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    const result = await response.json()
    return result
  } catch (error) {
    console.error("Failed to get bot info:", error)
    return { ok: false, error: error.message }
  }
}

export async function GET() {
  try {
    console.log("🔍 Checking bot status...")

    // Get bot info
    const botInfo = await getBotInfo()

    // Get webhook info
    const webhookInfo = await getWebhookInfo()

    const status = {
      bot_info: botInfo,
      webhook_info: webhookInfo,
      bot_running: botInfo.ok && webhookInfo.ok,
      timestamp: new Date().toISOString(),
      environment: {
        bot_token_configured: !!BOT_TOKEN,
        webhook_secret_configured: !!WEBHOOK_SECRET,
        node_env: process.env.NODE_ENV || "development",
      },
    }

    console.log("📊 Bot status:", status)

    return NextResponse.json(status)
  } catch (error) {
    console.error("❌ Status check failed:", error)
    return NextResponse.json(
      {
        error: "Failed to check bot status",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, webhook_url } = body

    console.log("🔧 Bot setup action:", action)

    if (action === "setup" || action === "start") {
      // Determine webhook URL
      const baseUrl =
        webhook_url || process.env.WEBHOOK_URL?.replace("/api/telegram/webhook", "") || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "https://multichain-sniper-pro.vercel.app"

      const fullWebhookUrl = `${baseUrl}/api/telegram/webhook`

      console.log("🔗 Setting webhook URL:", fullWebhookUrl)

      // Set webhook
      const webhookResult = await setWebhook(fullWebhookUrl)

      if (webhookResult.ok) {
        console.log("✅ Webhook set successfully")

        // Get updated status
        const botInfo = await getBotInfo()
        const webhookInfo = await getWebhookInfo()

        return NextResponse.json({
          success: true,
          message: "Bot setup completed successfully",
          webhook_url: fullWebhookUrl,
          bot_info: botInfo,
          webhook_info: webhookInfo,
          timestamp: new Date().toISOString(),
        })
      } else {
        console.error("❌ Failed to set webhook:", webhookResult)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to set webhook",
            details: webhookResult,
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Invalid action",
        available_actions: ["setup", "start"],
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("❌ Setup failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Setup failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
