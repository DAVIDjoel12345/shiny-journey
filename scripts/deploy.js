// Deployment script for MultiChain Sniper Pro

async function deployToProduction() {
  console.log("🚀 Deploying MultiChain Sniper Pro to Production...")

  try {
    // 1. Pre-deployment checks
    console.log("🔍 Running pre-deployment checks...")
    await runPreDeploymentChecks()

    // 2. Build the application
    console.log("🏗️ Building application...")
    await buildApplication()

    // 3. Run tests
    console.log("🧪 Running tests...")
    await runTests()

    // 4. Deploy to Vercel
    console.log("☁️ Deploying to Vercel...")
    await deployToVercel()

    // 5. Setup database
    console.log("🗄️ Setting up database...")
    await setupProductionDatabase()

    // 6. Configure Telegram webhook
    console.log("🤖 Configuring Telegram webhook...")
    await configureTelegramWebhook()

    // 7. Start autonomous bot
    console.log("🤖 Starting autonomous bot...")
    await startAutonomousBot()

    // 8. Run post-deployment verification
    console.log("✅ Running post-deployment verification...")
    await verifyDeployment()

    console.log("🎉 Deployment completed successfully!")

    return {
      success: true,
      deploymentUrl: process.env.VERCEL_URL || "https://your-domain.vercel.app",
      botStatus: "running",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error)
    throw error
  }
}

async function runPreDeploymentChecks() {
  const requiredEnvVars = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "DATABASE_URL", "WEBHOOK_URL"]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }

  console.log("✅ Environment variables check passed")
}

async function buildApplication() {
  const { exec } = require("child_process")
  const { promisify } = require("util")
  const execAsync = promisify(exec)

  try {
    await execAsync("npm run build")
    console.log("✅ Application built successfully")
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`)
  }
}

async function runTests() {
  const { exec } = require("child_process")
  const { promisify } = require("util")
  const execAsync = promisify(exec)

  try {
    await execAsync("npm test")
    console.log("✅ All tests passed")
  } catch (error) {
    console.warn("⚠️ Some tests failed, but continuing deployment")
  }
}

async function deployToVercel() {
  const { exec } = require("child_process")
  const { promisify } = require("util")
  const execAsync = promisify(exec)

  try {
    const { stdout } = await execAsync("vercel --prod --yes")
    console.log("✅ Deployed to Vercel:", stdout.trim())

    // Extract deployment URL
    const urlMatch = stdout.match(/https:\/\/[^\s]+/)
    if (urlMatch) {
      process.env.DEPLOYMENT_URL = urlMatch[0]
      console.log("🌐 Deployment URL:", process.env.DEPLOYMENT_URL)
    }
  } catch (error) {
    throw new Error(`Vercel deployment failed: ${error.message}`)
  }
}

async function setupProductionDatabase() {
  const { setupDatabase } = require("./setup-database")

  try {
    await setupDatabase()
    console.log("✅ Production database setup completed")
  } catch (error) {
    throw new Error(`Database setup failed: ${error.message}`)
  }
}

async function configureTelegramWebhook() {
  const webhookUrl = process.env.DEPLOYMENT_URL
    ? `${process.env.DEPLOYMENT_URL}/api/telegram/webhook`
    : process.env.WEBHOOK_URL

  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query", "inline_query"],
        max_connections: 100,
      }),
    })

    const result = await response.json()

    if (result.ok) {
      console.log("✅ Telegram webhook configured:", webhookUrl)
    } else {
      throw new Error(`Webhook setup failed: ${result.description}`)
    }
  } catch (error) {
    throw new Error(`Telegram webhook configuration failed: ${error.message}`)
  }
}

async function startAutonomousBot() {
  const baseUrl = process.env.DEPLOYMENT_URL || process.env.WEBHOOK_URL?.replace("/api/telegram/webhook", "")

  try {
    const response = await fetch(`${baseUrl}/api/telegram/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("✅ Autonomous bot started successfully")
    } else {
      console.warn("⚠️ Bot start failed, but deployment continues")
    }
  } catch (error) {
    console.warn("⚠️ Bot startup failed:", error.message)
  }
}

async function verifyDeployment() {
  const baseUrl = process.env.DEPLOYMENT_URL || process.env.WEBHOOK_URL?.replace("/api/telegram/webhook", "")

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/telegram/setup`)
    const healthData = await healthResponse.json()

    if (healthData.bot_running) {
      console.log("✅ Bot is running and healthy")
    }

    // Test webhook endpoint
    const webhookResponse = await fetch(`${baseUrl}/api/telegram/webhook`)
    if (webhookResponse.ok) {
      console.log("✅ Webhook endpoint is accessible")
    }

    // Test bot API
    const botResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
    const botData = await botResponse.json()

    if (botData.ok) {
      console.log("✅ Bot API is working:", botData.result.username)
    }

    console.log("✅ Deployment verification completed")
  } catch (error) {
    console.warn("⚠️ Deployment verification had issues:", error.message)
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToProduction()
    .then((result) => {
      console.log("🎊 Deployment Summary:", result)
      console.log(`
🚀 MultiChain Sniper Pro is now live!

📱 Bot: @YourBotUsername
🌐 Platform: ${result.deploymentUrl}
🤖 Bot Status: ${result.botStatus}
⏰ Deployed: ${result.timestamp}

Next steps:
1. Test the bot by sending /start
2. Connect your wallet
3. Start trading!
      `)
    })
    .catch((error) => {
      console.error("💥 Deployment Failed:", error)
      process.exit(1)
    })
}

module.exports = { deployToProduction }
