import { NextResponse } from "next/server"

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
    services: {
      telegram_bot: {
        status: "operational",
        token_configured: !!process.env.TELEGRAM_BOT_TOKEN,
      },
      database: {
        status: "operational",
        url_configured: !!process.env.DATABASE_URL,
      },
      webhook: {
        status: "operational",
        secret_configured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      },
    },
    version: "1.0.0",
  }

  return NextResponse.json(health)
}
