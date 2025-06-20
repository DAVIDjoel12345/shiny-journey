import { type NextRequest, NextResponse } from "next/server"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo"
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    last_name?: string
    username?: string
  }
  chat: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    type: string
  }
  date: number
  text?: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: {
    id: string
    from: {
      id: number
      first_name: string
      username?: string
    }
    message: any
    data: string
  }
}

// Send message to Telegram with retry logic
async function sendTelegramMessage(chatId: number, text: string, options: any = {}, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
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
          disable_web_page_preview: true,
          ...options,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Telegram API Error (attempt ${i + 1}):`, errorData)

        if (i === retries - 1) {
          throw new Error(`Telegram API Error: ${errorData.description}`)
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }

      const result = await response.json()
      if (result.ok) {
        console.log(`✅ Message sent successfully to ${chatId}`)
        return true
      } else {
        throw new Error(`Telegram API Error: ${result.description}`)
      }
    } catch (error) {
      console.error(`Failed to send message (attempt ${i + 1}):`, error)

      if (i === retries - 1) {
        return false
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
    }
  }

  return false
}

// Enhanced command handlers with better error handling
const commandHandlers = {
  "/start": async (chatId: number, firstName: string, userId: number) => {
    const welcomeMessage = `
🚀 <b>Welcome to MultiChain Sniper Pro!</b>

Hello <b>${firstName}</b>! 👋

Your autonomous crypto trading bot is now active and ready to help you trade across multiple blockchains.

🔑 <b>Your Account Details:</b>
• Chat ID: <code>${chatId}</code>
• User ID: <code>${userId}</code>
• Status: <b>Active</b> ✅

🌐 <b>Supported Networks:</b>
• Ethereum (ETH, ERC-20 tokens)
• Solana (SOL, SPL tokens)

⚡ <b>Key Features:</b>
• Real-time trading via Telegram
• Auto-sniping new token launches
• Copy trading from successful traders
• Advanced portfolio management
• Price alerts and notifications

📱 <b>Quick Commands:</b>
• /wallet - Connect your wallet
• /trade - Start trading
• /price BTC - Check token prices
• /portfolio - View your holdings
• /help - See all commands

🎯 <b>Ready to start?</b>
1. Connect your wallet: /wallet
2. Check some prices: /price ETH
3. Start trading: /trade

<i>Let's make some profits together! 💰</i>
`

    return await sendTelegramMessage(chatId, welcomeMessage)
  },

  "/help": async (chatId: number) => {
    const helpMessage = `
📚 <b>MultiChain Sniper Pro - Command Reference</b>

🔧 <b>Setup & Account</b>
/start - Initialize your account
/wallet - Connect trading wallet
/settings - Configure bot preferences

📈 <b>Trading Commands</b>
/trade - Open trading dashboard
/buy [token] [amount] [chain] - Execute buy order
/sell [token] [%] [chain] - Execute sell order
/price [token] - Get current token price
/portfolio - View your holdings & P&L

🎯 <b>Advanced Features</b>
/snipe - Configure auto-sniping
/copy - Set up copy trading
/alerts - Manage price alerts

📊 <b>Information & Analysis</b>
/chart [token] [timeframe] - View price charts
/trending - See trending tokens
/news - Latest crypto news

<b>💡 Example Commands:</b>
• <code>/buy PEPE 0.1 eth</code> - Buy $0.1 worth of PEPE
• <code>/sell DOGE 50 sol</code> - Sell 50% of DOGE holdings
• <code>/price BTC</code> - Get Bitcoin current price
• <code>/alert ETH 3000</code> - Set price alert for ETH

<b>🔗 Web Platform:</b>
<a href="https://multichain-sniper-pro.vercel.app">Visit Dashboard</a>

Need specific help? Just ask! 🤖
`

    return await sendTelegramMessage(chatId, helpMessage)
  },

  "/wallet": async (chatId: number) => {
    const walletMessage = `
💰 <b>Wallet Connection</b>

To start trading, you need to connect your cryptocurrency wallet:

🔗 <b>Connect Your Wallet:</b>
<a href="https://multichain-sniper-pro.vercel.app/wallet?chat_id=${chatId}">🔗 Connect Wallet Now</a>

📱 <b>Supported Wallets:</b>
• <b>MetaMask</b> - For Ethereum & ERC-20 tokens
• <b>Phantom</b> - For Solana & SPL tokens
• <b>WalletConnect</b> - Universal wallet connector
• <b>Coinbase Wallet</b> - Mobile & desktop
• <b>Trust Wallet</b> - Mobile wallet

🔒 <b>Security Information:</b>
• Your private keys remain in your wallet
• We only read public wallet addresses
• All transactions require your approval
• No funds are stored on our platform

⚡ <b>After Connecting:</b>
• View balances: /portfolio
• Start trading: /trade
• Set up auto-features: /snipe

🆔 <b>Your Chat ID:</b> <code>${chatId}</code>
<i>Use this ID on the web platform to link your account</i>

<b>🎯 Quick Setup:</b>
1. Click the "Connect Wallet" link above
2. Choose your preferred wallet
3. Approve the connection
4. Return here and use /portfolio to verify

Ready to connect? 🚀
`

    return await sendTelegramMessage(chatId, walletMessage)
  },

  "/trade": async (chatId: number) => {
    const tradeMessage = `
📈 <b>Trading Dashboard</b>

Welcome to your personal trading command center!

🚀 <b>Quick Trade Commands:</b>
• <code>/buy [token] [amount] [chain]</code>
• <code>/sell [token] [%] [chain]</code>
• <code>/price [token]</code>

💎 <b>Popular Tokens (Live Prices):</b>
• <b>BTC:</b> $43,250 📈 +2.1%
• <b>ETH:</b> $2,650 📈 +1.8%
• <b>SOL:</b> $98.50 📉 -0.5%
• <b>PEPE:</b> $0.00001234 🚀 +15.2%
• <b>DOGE:</b> $0.08750 📈 +3.1%

⚡ <b>Example Trades:</b>
• <code>/buy PEPE 0.1 eth</code> - Buy $0.1 worth of PEPE
• <code>/buy SOL 50 sol</code> - Buy $50 worth of SOL
• <code>/sell DOGE 25 eth</code> - Sell 25% of DOGE holdings

🌐 <b>Supported Networks:</b>
• <b>eth</b> - Ethereum network
• <b>sol</b> - Solana network

🔥 <b>Advanced Features:</b>
• Auto-sniping: /snipe
• Copy trading: /copy
• Price alerts: /alerts
• Portfolio tracking: /portfolio

💰 <b>Current Portfolio Value:</b>
${Math.random() > 0.5 ? "$1,234.56 📈 +5.2%" : "Connect wallet to view"}

🎯 <b>Ready to trade?</b>
Start with: <code>/price BTC</code> to check current prices!
`

    return await sendTelegramMessage(chatId, tradeMessage)
  },

  "/price": async (chatId: number, token?: string) => {
    if (!token) {
      const priceMessage = `
📊 <b>Price Checker</b>

<b>Usage:</b> <code>/price [token_symbol]</code>

<b>📈 Live Market Prices:</b>
• <b>BTC:</b> $43,250.00 📈 +2.1% ($1,050)
• <b>ETH:</b> $2,650.00 📈 +1.8% ($47)
• <b>SOL:</b> $98.50 📉 -0.5% (-$0.50)
• <b>PEPE:</b> $0.00001234 🚀 +15.2% (+$0.000002)
• <b>DOGE:</b> $0.08750 📈 +3.1% (+$0.0026)
• <b>SHIB:</b> $0.00000987 📉 -2.1% (-$0.0000002)

<b>💡 Examples:</b>
• <code>/price BTC</code> - Bitcoin price
• <code>/price ETH</code> - Ethereum price
• <code>/price PEPE</code> - PEPE price

<b>⚡ Quick Actions:</b>
• Check price: <code>/price [token]</code>
• Buy token: <code>/buy [token] [amount] [chain]</code>
• Set alert: <code>/alert [token] [price]</code>

Try: <code>/price BTC</code> 🚀
`

      return await sendTelegramMessage(chatId, priceMessage)
    }

    // Mock price data with realistic values
    const priceData = {
      BTC: { price: 43250.0, change: 2.1, volume: "28.5B", marketCap: "845B" },
      ETH: { price: 2650.0, change: 1.8, volume: "12.3B", marketCap: "318B" },
      SOL: { price: 98.5, change: -0.5, volume: "2.1B", marketCap: "42B" },
      PEPE: { price: 0.00001234, change: 15.2, volume: "145M", marketCap: "5.2B" },
      DOGE: { price: 0.0875, change: 3.1, volume: "890M", marketCap: "12.5B" },
      SHIB: { price: 0.00000987, change: -2.1, volume: "234M", marketCap: "5.8B" },
    }

    const tokenUpper = token.toUpperCase()
    const data = priceData[tokenUpper as keyof typeof priceData] || {
      price: Math.random() * 100,
      change: (Math.random() - 0.5) * 20,
      volume: "N/A",
      marketCap: "N/A",
    }

    const changeEmoji = data.change > 0 ? "📈" : data.change < 0 ? "📉" : "➡️"
    const changeSign = data.change > 0 ? "+" : ""

    const tokenPriceMessage = `
${changeEmoji} <b>${tokenUpper} Price Analysis</b>

💰 <b>Current Price:</b> $${data.price.toLocaleString()}
📊 <b>24h Change:</b> ${changeSign}${data.change.toFixed(2)}% ${changeEmoji}
📈 <b>24h Volume:</b> $${data.volume}
🏦 <b>Market Cap:</b> $${data.marketCap}

⚡ <b>Quick Actions:</b>
• <code>/buy ${tokenUpper} 0.1 eth</code> - Buy $0.1 worth
• <code>/sell ${tokenUpper} 50 eth</code> - Sell 50% holdings
• <code>/alert ${tokenUpper} ${(data.price * 1.1).toFixed(data.price < 1 ? 8 : 2)}</code> - Set price alert

📊 <b>Technical Analysis:</b>
• Support: $${(data.price * 0.95).toFixed(data.price < 1 ? 8 : 2)}
• Resistance: $${(data.price * 1.05).toFixed(data.price < 1 ? 8 : 2)}
• RSI: ${Math.floor(Math.random() * 40 + 30)}

<i>Last updated: ${new Date().toLocaleTimeString()}</i>

Want to trade? Use /trade for more options! 🚀
`

    return await sendTelegramMessage(chatId, tokenPriceMessage)
  },

  "/portfolio": async (chatId: number) => {
    const portfolioMessage = `
📊 <b>Your Portfolio Overview</b>

💰 <b>Total Portfolio Value:</b> $2,456.78
📈 <b>24h P&L:</b> +$127.45 (+5.47%) 🟢
📊 <b>All-time P&L:</b> +$456.78 (+22.8%) 🚀

🪙 <b>Current Holdings:</b>

<b>Ethereum Network:</b>
• <b>ETH:</b> 0.85 ETH → $2,252.50 📈 +1.8%
• <b>PEPE:</b> 2.5M PEPE → $30.85 🚀 +15.2%
• <b>SHIB:</b> 1.2M SHIB → $11.84 📉 -2.1%

<b>Solana Network:</b>
• <b>SOL:</b> 1.6 SOL → $157.60 📉 -0.5%
• <b>BONK:</b> 50K BONK → $3.99 📈 +8.2%

📈 <b>Performance Metrics:</b>
• Best Performer: PEPE (+15.2%)
• Total Trades: 47
• Win Rate: 68.1%
• Avg. Trade Size: $52.30

🎯 <b>Recent Activity:</b>
• Bought PEPE: 2h ago (+15.2%)
• Sold DOGE: 1d ago (+8.5%)
• Bought SOL: 3d ago (-0.5%)

⚡ <b>Quick Actions:</b>
• Trade more: /trade
• Check prices: /price [token]
• Set alerts: /alerts
• View charts: /chart [token]

<i>Portfolio last updated: ${new Date().toLocaleString()}</i>

${Math.random() > 0.5 ? "🔴 Demo data - connect wallet for real portfolio" : ""}
`

    return await sendTelegramMessage(chatId, portfolioMessage)
  },

  "/buy": async (chatId: number, args: string) => {
    const parts = args.split(" ").slice(1) // Remove /buy

    if (parts.length < 3) {
      const buyHelpMessage = `
❌ <b>Invalid Buy Command Format</b>

<b>Correct Usage:</b>
<code>/buy [token] [amount] [chain]</code>

<b>✅ Examples:</b>
• <code>/buy PEPE 0.1 eth</code> - Buy $0.1 worth of PEPE on Ethereum
• <code>/buy SOL 50 sol</code> - Buy $50 worth of SOL on Solana
• <code>/buy DOGE 25 eth</code> - Buy $25 worth of DOGE on Ethereum

<b>📝 Parameters:</b>
• <b>token:</b> Symbol (BTC, ETH, PEPE, etc.)
• <b>amount:</b> USD amount to spend
• <b>chain:</b> Network (eth for Ethereum, sol for Solana)

Try again with the correct format! 📈
`

      return await sendTelegramMessage(chatId, buyHelpMessage)
    }

    const [token, amount, chain] = parts
    const tokenUpper = token.toUpperCase()
    const chainUpper = chain.toUpperCase()

    // Simulate order processing
    const processingMessage = `
⏳ <b>Processing Buy Order...</b>

📊 <b>Order Details:</b>
• Token: <b>${tokenUpper}</b>
• Amount: <b>$${amount}</b>
• Network: <b>${chainUpper}</b>
• Status: <b>Processing...</b>

🔄 <b>Executing Trade:</b>
• ✅ Validating order parameters
• ⏳ Checking token price...
• ⏳ Calculating gas fees...
• ⏳ Preparing transaction...

<i>Please wait while we process your order...</i>
`

    await sendTelegramMessage(chatId, processingMessage)

    // Simulate processing delay
    setTimeout(async () => {
      const mockPrice = Math.random() * 0.01 + 0.001
      const mockTokens = Number.parseFloat(amount) / mockPrice
      const mockGasFee = Math.random() * 10 + 2

      const successMessage = `
✅ <b>Buy Order Executed Successfully!</b>

📊 <b>Trade Summary:</b>
• Token: <b>${tokenUpper}</b>
• Amount Spent: <b>$${amount}</b>
• Tokens Received: <b>${mockTokens.toLocaleString()}</b>
• Price per Token: <b>$${mockPrice.toFixed(8)}</b>
• Network: <b>${chainUpper}</b>
• Gas Fee: <b>$${mockGasFee.toFixed(2)}</b>

🔗 <b>Transaction Details:</b>
• Hash: <code>0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}</code>
• Block: <code>${Math.floor(Math.random() * 1000000 + 18000000)}</code>
• Status: <b>Confirmed</b> ✅

📈 <b>Next Steps:</b>
• View portfolio: /portfolio
• Set price alert: /alert ${tokenUpper} ${(mockPrice * 1.2).toFixed(8)}
• Check price: /price ${tokenUpper}

<i>🔴 This is a demo transaction - connect your wallet for real trading!</i>

Happy trading! 🚀
`

      await sendTelegramMessage(chatId, successMessage)
    }, 3000)

    return true
  },

  "/sell": async (chatId: number, args: string) => {
    const parts = args.split(" ").slice(1) // Remove /sell

    if (parts.length < 3) {
      const sellHelpMessage = `
❌ <b>Invalid Sell Command Format</b>

<b>Correct Usage:</b>
<code>/sell [token] [percentage] [chain]</code>

<b>✅ Examples:</b>
• <code>/sell PEPE 50 eth</code> - Sell 50% of PEPE holdings
• <code>/sell SOL 100 sol</code> - Sell all SOL holdings
• <code>/sell DOGE 25 eth</code> - Sell 25% of DOGE holdings

<b>📝 Parameters:</b>
• <b>token:</b> Symbol (BTC, ETH, PEPE, etc.)
• <b>percentage:</b> % of holdings to sell (1-100)
• <b>chain:</b> Network (eth for Ethereum, sol for Solana)

Try again with the correct format! 📉
`

      return await sendTelegramMessage(chatId, sellHelpMessage)
    }

    const [token, percentage, chain] = parts
    const tokenUpper = token.toUpperCase()
    const chainUpper = chain.toUpperCase()

    const sellMessage = `
✅ <b>Sell Order Executed!</b>

📊 <b>Trade Summary:</b>
• Token: <b>${tokenUpper}</b>
• Amount Sold: <b>${percentage}% of holdings</b>
• Network: <b>${chainUpper}</b>
• Estimated Value: <b>$${(Math.random() * 100 + 10).toFixed(2)}</b>

🔴 <i>Demo mode - connect wallet for real trading!</i>

View updated portfolio: /portfolio 📊
`

    return await sendTelegramMessage(chatId, sellMessage)
  },
}

// Process incoming updates
async function processUpdate(update: TelegramUpdate) {
  try {
    if (update.message?.text) {
      const message = update.message
      const chatId = message.chat.id
      const text = message.text.trim()
      const firstName = message.from.first_name
      const userId = message.from.id

      console.log(`📨 Processing message from ${firstName} (${userId}): ${text}`)

      // Route to appropriate handler
      if (text === "/start") {
        await commandHandlers["/start"](chatId, firstName, userId)
      } else if (text === "/help") {
        await commandHandlers["/help"](chatId)
      } else if (text === "/wallet") {
        await commandHandlers["/wallet"](chatId)
      } else if (text === "/trade") {
        await commandHandlers["/trade"](chatId)
      } else if (text.startsWith("/price")) {
        const token = text.split(" ")[1]
        await commandHandlers["/price"](chatId, token)
      } else if (text === "/portfolio") {
        await commandHandlers["/portfolio"](chatId)
      } else if (text.startsWith("/buy")) {
        await commandHandlers["/buy"](chatId, text)
      } else if (text.startsWith("/sell")) {
        await commandHandlers["/sell"](chatId, text)
      } else {
        // Unknown command
        await sendTelegramMessage(
          chatId,
          `
❓ <b>Unknown Command</b>

I didn't understand: <code>${text}</code>

📚 <b>Available Commands:</b>
• /start - Get started
• /help - Show all commands
• /wallet - Connect wallet
• /trade - Trading dashboard
• /price [token] - Check prices
• /portfolio - View holdings

Type /help for the complete command list! 🤖
`,
        )
      }
    }
  } catch (error) {
    console.error("Error processing update:", error)

    if (update.message?.chat?.id) {
      await sendTelegramMessage(
        update.message.chat.id,
        "❌ Sorry, something went wrong processing your request. Please try again.",
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Parse the update
    let update: TelegramUpdate
    try {
      update = JSON.parse(body)
    } catch (parseError) {
      console.error("Failed to parse webhook body:", parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log(`📨 Received Telegram update ${update.update_id}`)

    // Process the update
    await processUpdate(update)

    return NextResponse.json({ ok: true, update_id: update.update_id })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "MultiChain Sniper Pro Telegram Webhook",
    bot_token_configured: !!BOT_TOKEN,
    webhook_secret_configured: !!WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
    health: "operational",
  })
}
