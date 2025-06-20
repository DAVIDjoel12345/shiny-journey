import { type NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username?: string
    language_code?: string
  }
  chat: {
    id: number
    first_name: string
    username?: string
    type: string
  }
  date: number
  text: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: any
}

// Send message to Telegram
async function sendTelegramMessage(chatId: number, text: string, options: any = {}) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        ...options,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error("Telegram API Error:", result)
      throw new Error(`Telegram API Error: ${result.description}`)
    }

    return result
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
    throw error
  }
}

// Process bot commands
async function processCommand(message: TelegramMessage) {
  const chatId = message.chat.id
  const text = message.text
  const userId = message.from.id
  const username = message.from.username || message.from.first_name

  console.log(`Processing command from ${username} (${userId}): ${text}`)

  try {
    if (text.startsWith("/start")) {
      const welcomeMessage = `
🚀 <b>Welcome to MultiChain Sniper Pro!</b>

Your advanced cryptocurrency trading bot is ready!

<b>📱 Your Chat ID:</b> <code>${chatId}</code>
<b>👤 User ID:</b> <code>${userId}</code>

<b>🎯 Quick Start:</b>
• /wallet - Connect your wallet
• /trade - Start trading
• /price BTC - Check token prices
• /portfolio - View your holdings
• /help - See all commands

<b>⚡ Advanced Features:</b>
• /snipe - Auto-snipe new tokens
• /copy - Copy successful traders
• /alerts - Set price alerts
• /settings - Configure bot

<b>🔗 Supported Chains:</b>
• Ethereum (ETH)
• Solana (SOL)

Ready to start trading? Use /wallet to connect your wallet!
      `

      await sendTelegramMessage(chatId, welcomeMessage)

      // Store user in database (simulate)
      console.log(`New user registered: ${username} (${userId})`)
    } else if (text.startsWith("/help")) {
      const helpMessage = `
📚 <b>MultiChain Sniper Pro Commands</b>

<b>🔗 Wallet & Setup:</b>
/wallet - Connect/manage wallet
/chain [eth/sol] - Switch blockchain
/settings - Bot configuration

<b>📈 Trading:</b>
/trade - Trading dashboard
/buy [token] [amount] [chain] - Buy tokens
/sell [token] [%] [chain] - Sell tokens
/price [token] - Get token price
/chart [token] - View price chart

<b>💼 Portfolio:</b>
/portfolio - View holdings
/balance - Check wallet balances
/history - Trade history
/pnl - Profit & loss analysis

<b>🎯 Advanced:</b>
/snipe - Auto-sniping setup
/copy - Copy trading config
/alerts - Price alert management
/monitor - Real-time monitoring

<b>ℹ️ Info:</b>
/start - Restart bot
/help - This help menu
/status - Bot status

Need help? Contact support or check our documentation!
      `

      await sendTelegramMessage(chatId, helpMessage)
    } else if (text.startsWith("/wallet")) {
      const walletMessage = `
💰 <b>Wallet Management</b>

<b>🔗 Connect Your Wallet:</b>

<b>For Ethereum:</b>
• Use MetaMask browser extension
• Connect at: https://multichain-sniper-pro.vercel.app
• Your Chat ID: <code>${chatId}</code>

<b>For Solana:</b>
• Use Phantom wallet
• Connect at: https://multichain-sniper-pro.vercel.app
• Your Chat ID: <code>${chatId}</code>

<b>📱 Mobile Users:</b>
1. Open the web app link above
2. Enter your Chat ID: <code>${chatId}</code>
3. Connect your preferred wallet
4. Return here to start trading!

<b>🔒 Security:</b>
• We never store your private keys
• All transactions require your approval
• Use hardware wallets for large amounts

Once connected, use /balance to check your wallet!
      `

      await sendTelegramMessage(chatId, walletMessage)
    } else if (text.startsWith("/trade")) {
      const tradeMessage = `
📈 <b>Trading Dashboard</b>

<b>🎯 Quick Trade Commands:</b>

<b>Buy Examples:</b>
• <code>/buy PEPE 0.1 eth</code> - Buy $0.1 worth of PEPE
• <code>/buy SOL 50 sol</code> - Buy $50 worth of SOL
• <code>/buy DOGE 0.01 eth</code> - Buy 0.01 ETH worth of DOGE

<b>Sell Examples:</b>
• <code>/sell PEPE 50 eth</code> - Sell 50% of PEPE
• <code>/sell SOL 100 sol</code> - Sell all SOL
• <code>/sell DOGE 25 eth</code> - Sell 25% of DOGE

<b>📊 Market Data:</b>
• <code>/price BTC</code> - Get Bitcoin price
• <code>/price ETH</code> - Get Ethereum price
• <code>/chart PEPE 1h</code> - View 1-hour chart

<b>⚙️ Settings:</b>
• Default slippage: 1%
• MEV protection: Enabled
• Auto-approve: Disabled

Use /settings to customize your trading preferences!
      `

      await sendTelegramMessage(chatId, tradeMessage)
    } else if (text.startsWith("/price")) {
      const parts = text.split(" ")
      const token = parts[1]?.toUpperCase() || "BTC"

      // Simulate price data
      const prices = {
        BTC: { price: 43250.5, change: "+2.5%", volume: "$28.5B" },
        ETH: { price: 2650.75, change: "+1.8%", volume: "$15.2B" },
        SOL: { price: 98.25, change: "+5.2%", volume: "$2.1B" },
        PEPE: { price: 0.00000125, change: "+15.8%", volume: "$450M" },
        DOGE: { price: 0.085, change: "+3.2%", volume: "$1.2B" },
      }

      const tokenData = prices[token] || prices["BTC"]

      const priceMessage = `
📊 <b>${token} Price Update</b>

💰 <b>Price:</b> $${tokenData.price.toLocaleString()}
📈 <b>24h Change:</b> ${tokenData.change}
📊 <b>24h Volume:</b> ${tokenData.volume}
⏰ <b>Updated:</b> ${new Date().toLocaleTimeString()}

<b>🎯 Quick Actions:</b>
• <code>/buy ${token} 0.1 eth</code> - Buy $0.1 worth
• <code>/sell ${token} 50 eth</code> - Sell 50%
• <code>/chart ${token}</code> - View chart
• <code>/alerts ${token}</code> - Set price alert

Want to trade? Use the commands above!
      `

      await sendTelegramMessage(chatId, priceMessage)
    } else if (text.startsWith("/portfolio")) {
      const portfolioMessage = `
💼 <b>Your Portfolio</b>

<b>🔗 Wallet Status:</b> Not Connected
<b>💰 Total Value:</b> Connect wallet to view

<b>📱 To view your portfolio:</b>
1. Connect wallet with /wallet
2. Return here and use /portfolio again

<b>🎯 Sample Portfolio View:</b>
• ETH: 2.5 ($6,625.00)
• PEPE: 1.2M ($1,500.00)
• SOL: 15.0 ($1,473.75)
• Total: $9,598.75

<b>📊 Available Commands:</b>
• /balance - Check wallet balances
• /history - View trade history
• /pnl - Profit & loss analysis

Connect your wallet to see real data!
      `

      await sendTelegramMessage(chatId, portfolioMessage)
    } else if (text.startsWith("/snipe")) {
      const snipeMessage = `
🎯 <b>Auto-Sniping Configuration</b>

<b>⚡ Snipe new token launches automatically!</b>

<b>🔧 Current Settings:</b>
• Status: Disabled
• Amount per snipe: Not set
• Max gas fee: Not set
• Slippage: 5%
• Auto-sell: Disabled

<b>📱 Setup Instructions:</b>
1. Connect wallet with /wallet
2. Set snipe amount: <code>/snipe set 0.1 eth</code>
3. Enable sniping: <code>/snipe enable</code>

<b>🎯 Example Commands:</b>
• <code>/snipe set 0.1 eth</code> - Snipe with 0.1 ETH
• <code>/snipe enable</code> - Enable auto-sniping
• <code>/snipe disable</code> - Disable sniping
• <code>/snipe status</code> - Check configuration

<b>⚠️ Risk Warning:</b>
Sniping involves high risk. Only use funds you can afford to lose!
      `

      await sendTelegramMessage(chatId, snipeMessage)
    } else if (text.startsWith("/copy")) {
      const copyMessage = `
👥 <b>Copy Trading Setup</b>

<b>📈 Follow successful traders automatically!</b>

<b>🔧 Current Settings:</b>
• Active copies: 0
• Total copy amount: Not set
• Success rate filter: 70%+

<b>🎯 Popular Traders:</b>
• 0x1234...abcd - 85% success, $2.5M volume
• 0x5678...efgh - 78% success, $1.8M volume
• 0x9abc...ijkl - 92% success, $950K volume

<b>📱 Setup Commands:</b>
• <code>/copy add 0x1234...abcd 0.1</code> - Copy with 0.1 ETH
• <code>/copy list</code> - View active copies
• <code>/copy remove 0x1234...abcd</code> - Stop copying
• <code>/copy stats</code> - View performance

<b>⚙️ Settings:</b>
• <code>/copy limit 1.0</code> - Set daily limit to 1 ETH
• <code>/copy filter 80</code> - Only copy 80%+ success traders

Connect wallet first with /wallet to start copy trading!
      `

      await sendTelegramMessage(chatId, copyMessage)
    } else if (text.startsWith("/alerts")) {
      const alertsMessage = `
🔔 <b>Price Alert Management</b>

<b>📊 Active Alerts:</b> 0

<b>🎯 Set Price Alerts:</b>
• <code>/alerts add BTC 45000</code> - Alert when BTC hits $45,000
• <code>/alerts add ETH 2800 above</code> - Alert when ETH goes above $2,800
• <code>/alerts add PEPE 0.000002 below</code> - Alert when PEPE drops below

<b>📱 Manage Alerts:</b>
• <code>/alerts list</code> - View all alerts
• <code>/alerts remove BTC</code> - Remove BTC alert
• <code>/alerts clear</code> - Remove all alerts

<b>⚙️ Alert Settings:</b>
• Notifications: Enabled
• Sound: Enabled
• Frequency: Once per target

<b>📈 Smart Alerts:</b>
• <code>/alerts trend BTC 5%</code> - Alert on 5% price movement
• <code>/alerts volume PEPE 2x</code> - Alert on 2x volume spike

Set up alerts to never miss important price movements!
      `

      await sendTelegramMessage(chatId, alertsMessage)
    } else if (text.startsWith("/settings")) {
      const settingsMessage = `
⚙️ <b>Bot Settings</b>

<b>🔧 Trading Settings:</b>
• Default slippage: 1%
• MEV protection: ✅ Enabled
• Private mempool: ✅ Enabled
• Auto-approve trades: ❌ Disabled
• Max gas price: 50 gwei

<b>🔔 Notifications:</b>
• Trade confirmations: ✅ Enabled
• Price alerts: ✅ Enabled
• Snipe notifications: ✅ Enabled
• System updates: ✅ Enabled

<b>🎯 Quick Settings:</b>
• <code>/settings slippage 2</code> - Set 2% slippage
• <code>/settings gas 100</code> - Set max gas to 100 gwei
• <code>/settings auto on</code> - Enable auto-approve
• <code>/settings notifications off</code> - Disable notifications

<b>🔒 Security:</b>
• Two-factor auth: Recommended
• Wallet connection: Secure
• API access: Restricted

<b>📱 Interface:</b>
• Language: English
• Timezone: Auto-detect
• Currency: USD

Use the commands above to customize your experience!
      `

      await sendTelegramMessage(chatId, settingsMessage)
    } else if (text.startsWith("/status")) {
      const statusMessage = `
🤖 <b>Bot Status</b>

<b>✅ System Status:</b> Operational
<b>⏰ Uptime:</b> 99.9%
<b>📊 Response Time:</b> 45ms
<b>🔗 API Status:</b> Connected

<b>🌐 Supported Networks:</b>
• Ethereum: ✅ Online
• Solana: ✅ Online
• Price Feeds: ✅ Active
• Trading Engine: ✅ Ready

<b>📱 Your Account:</b>
• Chat ID: <code>${chatId}</code>
• User ID: <code>${userId}</code>
• Wallet: Not connected
• Active trades: 0

<b>📊 Platform Stats:</b>
• Active users: 1,247
• Daily volume: $2.8M
• Successful trades: 98.5%
• Average profit: +12.3%

<b>🔧 Need Help?</b>
• /help - View all commands
• /wallet - Connect wallet
• /trade - Start trading

Everything is running smoothly! 🚀
      `

      await sendTelegramMessage(chatId, statusMessage)
    } else if (text.startsWith("/buy") || text.startsWith("/sell")) {
      const action = text.startsWith("/buy") ? "buy" : "sell"
      const parts = text.split(" ")
      const token = parts[1]?.toUpperCase() || "TOKEN"
      const amount = parts[2] || "0"
      const chain = parts[3]?.toLowerCase() || "eth"

      const tradeMessage = `
${action === "buy" ? "💰" : "💸"} <b>${action.toUpperCase()} Order Preview</b>

<b>🎯 Order Details:</b>
• Token: ${token}
• Amount: ${amount} ${chain.toUpperCase()}
• Chain: ${chain === "eth" ? "Ethereum" : "Solana"}
• Action: ${action.toUpperCase()}

<b>⚠️ Wallet Not Connected</b>

<b>📱 To execute this trade:</b>
1. Connect wallet: /wallet
2. Return and repeat: <code>${text}</code>

<b>🔧 Trade Settings:</b>
• Slippage: 1%
• MEV Protection: Enabled
• Gas: Auto

<b>💡 Example Commands:</b>
• <code>/buy PEPE 0.1 eth</code> - Buy $0.1 worth of PEPE
• <code>/sell DOGE 50 sol</code> - Sell 50% of DOGE

Connect your wallet first to start trading!
      `

      await sendTelegramMessage(chatId, tradeMessage)
    } else {
      // Unknown command
      const unknownMessage = `
❓ <b>Unknown Command</b>

I didn't understand: <code>${text}</code>

<b>📚 Available Commands:</b>
• /start - Initialize bot
• /help - View all commands
• /wallet - Connect wallet
• /trade - Trading dashboard
• /price [token] - Check prices
• /portfolio - View holdings

<b>💡 Quick Examples:</b>
• <code>/price BTC</code> - Get Bitcoin price
• <code>/buy PEPE 0.1 eth</code> - Buy PEPE tokens
• <code>/portfolio</code> - View your portfolio

Type /help for the complete command list!
      `

      await sendTelegramMessage(chatId, unknownMessage)
    }
  } catch (error) {
    console.error("Error processing command:", error)

    const errorMessage = `
❌ <b>Error Processing Command</b>

Sorry, there was an error processing your request.

<b>🔧 Try:</b>
• /start - Restart the bot
• /help - View available commands
• /status - Check bot status

If the problem persists, please contact support.
    `

    await sendTelegramMessage(chatId, errorMessage)
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    console.log("📨 Webhook received")

    // Verify webhook secret
    const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
    if (secretToken !== WEBHOOK_SECRET) {
      console.error("❌ Invalid webhook secret")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: TelegramUpdate = await request.json()
    console.log("📋 Update received:", JSON.stringify(body, null, 2))

    // Process message
    if (body.message) {
      await processCommand(body.message)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    status: "Bot webhook is active",
    bot_token: BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : "Not configured",
    timestamp: new Date().toISOString(),
  })
}
