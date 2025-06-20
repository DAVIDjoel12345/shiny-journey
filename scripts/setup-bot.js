// Automatic bot setup script

const BOT_TOKEN = "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
const WEBHOOK_SECRET = "multichain_sniper_webhook_secret_2024"

async function setupTelegramBot() {
  console.log("🤖 Setting up Telegram Bot...")
  console.log("=".repeat(50))

  try {
    // 1. Get bot info
    console.log("📋 Step 1: Getting bot information...")
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()

    if (botInfo.ok) {
      console.log("✅ Bot Info:")
      console.log(`   • ID: ${botInfo.result.id}`)
      console.log(`   • Username: @${botInfo.result.username}`)
      console.log(`   • Name: ${botInfo.result.first_name}`)
      console.log(`   • Can Join Groups: ${botInfo.result.can_join_groups}`)
      console.log(`   • Can Read Messages: ${botInfo.result.can_read_all_group_messages}`)
    } else {
      throw new Error(`Bot info failed: ${botInfo.description}`)
    }

    // 2. Set webhook
    console.log("\n🔗 Step 2: Setting up webhook...")

    // Try multiple possible webhook URLs
    const possibleUrls = [
      "https://multichain-sniper-pro.vercel.app/api/telegram/webhook",
      "https://shiny-journey.vercel.app/api/telegram/webhook",
      process.env.WEBHOOK_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/telegram/webhook` : null,
    ].filter(Boolean)

    let webhookSet = false
    let finalWebhookUrl = ""

    for (const webhookUrl of possibleUrls) {
      console.log(`   🔄 Trying webhook URL: ${webhookUrl}`)

      const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: WEBHOOK_SECRET,
          allowed_updates: ["message", "callback_query", "inline_query"],
          max_connections: 100,
          drop_pending_updates: true,
        }),
      })

      const webhookResult = await webhookResponse.json()

      if (webhookResult.ok) {
        console.log(`   ✅ Webhook set successfully: ${webhookUrl}`)
        finalWebhookUrl = webhookUrl
        webhookSet = true
        break
      } else {
        console.log(`   ❌ Failed: ${webhookResult.description}`)
      }
    }

    if (!webhookSet) {
      throw new Error("Failed to set webhook with any URL")
    }

    // 3. Verify webhook
    console.log("\n✅ Step 3: Verifying webhook...")
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
    const webhookInfo = await webhookInfoResponse.json()

    if (webhookInfo.ok) {
      console.log("✅ Webhook Info:")
      console.log(`   • URL: ${webhookInfo.result.url}`)
      console.log(`   • Has Custom Certificate: ${webhookInfo.result.has_custom_certificate}`)
      console.log(`   • Pending Updates: ${webhookInfo.result.pending_update_count}`)
      console.log(`   • Max Connections: ${webhookInfo.result.max_connections}`)
      console.log(`   • Allowed Updates: ${webhookInfo.result.allowed_updates?.join(", ") || "All"}`)
    }

    // 4. Test the bot
    console.log("\n🧪 Step 4: Testing bot...")

    // Send a test message to admin if ADMIN_CHAT_ID is available
    if (process.env.ADMIN_CHAT_ID) {
      const testMessage = `
🎉 <b>MultiChain Sniper Pro Bot is LIVE!</b>

✅ Bot setup completed successfully
🔗 Webhook: ${finalWebhookUrl}
⏰ Setup time: ${new Date().toLocaleString()}

<b>🚀 Ready to use:</b>
• Send /start to begin
• Use /help for all commands
• Connect wallet with /wallet

<b>Bot Status:</b> 🟢 Operational
      `

      try {
        const testResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: process.env.ADMIN_CHAT_ID,
            text: testMessage,
            parse_mode: "HTML",
          }),
        })

        const testResult = await testResponse.json()
        if (testResult.ok) {
          console.log("✅ Test message sent to admin")
        } else {
          console.log("⚠️ Could not send test message:", testResult.description)
        }
      } catch (error) {
        console.log("⚠️ Test message failed:", error.message)
      }
    }

    console.log("\n" + "🎉".repeat(20))
    console.log("🎊 BOT SETUP COMPLETED SUCCESSFULLY! 🎊")
    console.log("🎉".repeat(20))

    const summary = {
      success: true,
      bot_username: `@${botInfo.result.username}`,
      bot_id: botInfo.result.id,
      webhook_url: finalWebhookUrl,
      setup_time: new Date().toISOString(),
      status: "operational",
    }

    console.log("\n📊 SETUP SUMMARY:")
    console.log(`🤖 Bot: ${summary.bot_username}`)
    console.log(`🆔 Bot ID: ${summary.bot_id}`)
    console.log(`🔗 Webhook: ${summary.webhook_url}`)
    console.log(`⏰ Setup: ${summary.setup_time}`)
    console.log(`📱 Status: ${summary.status}`)

    console.log("\n🎯 NEXT STEPS:")
    console.log("1. 📱 Open Telegram and search for your bot")
    console.log("2. 💬 Send /start to initialize")
    console.log("3. 💰 Use /wallet to connect your wallet")
    console.log("4. 📈 Start trading with /trade")

    console.log("\n🔗 USEFUL COMMANDS:")
    console.log("• /start - Initialize bot")
    console.log("• /help - View all commands")
    console.log("• /wallet - Connect wallet")
    console.log("• /trade - Start trading")
    console.log("• /price BTC - Check Bitcoin price")
    console.log("• /portfolio - View holdings")

    return summary
  } catch (error) {
    console.error("\n❌ BOT SETUP FAILED")
    console.error("Error:", error.message)

    console.log("\n🔧 TROUBLESHOOTING:")
    console.log("1. Check if bot token is valid")
    console.log("2. Verify webhook URL is accessible")
    console.log("3. Ensure bot has proper permissions")
    console.log("4. Check network connectivity")

    throw error
  }
}

// Run setup
setupTelegramBot()
  .then((result) => {
    console.log("\n🎊 Bot is ready for trading! Send /start to begin! 🎊")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Setup failed:", error.message)
    process.exit(1)
  })
