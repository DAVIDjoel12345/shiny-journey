// Bot initialization script

async function initializeBot() {
  console.log("🤖 Initializing MultiChain Sniper Pro Bot...")

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
  const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://multichain-sniper-pro.vercel.app/api/telegram/webhook"
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

  try {
    // 1. Get bot info
    console.log("📡 Getting bot information...")
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    const botData = await botResponse.json()

    if (botData.ok) {
      console.log("✅ Bot Info:", botData.result)
      console.log(`🤖 Bot Username: @${botData.result.username}`)
      console.log(`🆔 Bot ID: ${botData.result.id}`)
    } else {
      throw new Error(`Bot API Error: ${botData.description}`)
    }

    // 2. Set webhook
    console.log("🔗 Setting up webhook...")
    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"],
        max_connections: 100,
        drop_pending_updates: true,
      }),
    })

    const webhookData = await webhookResponse.json()

    if (webhookData.ok) {
      console.log("✅ Webhook set successfully")
      console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`)
    } else {
      throw new Error(`Webhook Error: ${webhookData.description}`)
    }

    // 3. Verify webhook
    console.log("🔍 Verifying webhook...")
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
    const webhookInfo = await webhookInfoResponse.json()

    if (webhookInfo.ok) {
      console.log("✅ Webhook Info:", webhookInfo.result)
      console.log(`📊 Pending Updates: ${webhookInfo.result.pending_update_count}`)
    }

    // 4. Send test message to admin (if configured)
    if (process.env.ADMIN_CHAT_ID) {
      console.log("📨 Sending test message to admin...")
      const testMessage = `
🚀 <b>MultiChain Sniper Pro Bot Initialized!</b>

✅ Bot is now online and ready
🔗 Webhook configured successfully
⏰ Started at: ${new Date().toLocaleString()}

🤖 Bot: @${botData.result.username}
🆔 ID: ${botData.result.id}
🌐 Webhook: ${WEBHOOK_URL}

Ready to start trading! 🎯
`

      const messageResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.ADMIN_CHAT_ID,
          text: testMessage,
          parse_mode: "HTML",
        }),
      })

      const messageData = await messageResponse.json()
      if (messageData.ok) {
        console.log("✅ Test message sent to admin")
      }
    }

    console.log("\n🎉 Bot initialization completed successfully!")
    console.log(`\n📱 Test your bot by sending /start to @${botData.result.username}`)

    return {
      success: true,
      bot: botData.result,
      webhook_url: WEBHOOK_URL,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Bot initialization failed:", error)
    throw error
  }
}

// Run if called directly
if (typeof window === "undefined" && require.main === module) {
  initializeBot()
    .then((result) => {
      console.log("🎊 Initialization Result:", result)
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Initialization Failed:", error)
      process.exit(1)
    })
}

module.exports = { initializeBot }
