#!/usr/bin/env node
/**
 * Auto-initialize MultiChain Sniper Pro Telegram bot.
 * 1. Validates BOT_TOKEN.
 * 2. (Re)sets the webhook.
 * 3. Verifies the webhook status.
 *
 * Exit codes
 *   0 – success
 *   1 – configuration/environment error
 *   2 – Telegram API error
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7587979044:AAHF1ML8S-_TL9eAuZTnatO1ugodjaFCQEo" // fallback for local tests
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://multichain-sniper-pro.vercel.app/api/telegram/webhook"
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "multichain_sniper_webhook_secret_2024"

async function callTelegram(method, body = undefined) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`
  const init = {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }

  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} – ${res.statusText}`)
  }
  const data = await res.json()
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`)
  }
  return data.result
}

async function setWebhook() {
  return callTelegram("setWebhook", {
    url: WEBHOOK_URL,
    secret_token: WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
    max_connections: 100,
    drop_pending_updates: true,
  })
}

async function verifyWebhook() {
  return callTelegram("getWebhookInfo")
}

async function main() {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not defined.")
    process.exit(1)
  }

  console.log("🤖 Initialising bot…")
  const me = await callTelegram("getMe")
  console.log(`   • Bot: @${me.username} (ID ${me.id})`)

  console.log("🔗 Setting webhook…")
  await setWebhook()
  console.log(`   • Webhook set to ${WEBHOOK_URL}`)

  console.log("🔍 Verifying webhook…")
  const info = await verifyWebhook()
  if (!info.url) {
    throw new Error("Webhook verification failed – URL is empty.")
  }
  console.log(`   • Webhook verified. Pending updates: ${info.pending_update_count}`)

  console.log("✅ Bot initialisation completed.")
  process.exit(0)
}

main().catch((err) => {
  console.error("💥 Auto-initialisation failed:", err.message)
  process.exit(err.message.includes("Telegram") ? 2 : 1)
})
