// Database setup script for production deployment

const { Pool } = require("pg")

async function setupDatabase() {
  console.log("🗄️ Setting up MultiChain Sniper Pro Database...")

  try {
    // Database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })

    console.log("📡 Connecting to database...")
    await pool.connect()
    console.log("✅ Database connected successfully")

    // Create tables
    console.log("📋 Creating tables...")

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE,
        chat_id BIGINT UNIQUE,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        wallet_address VARCHAR(255),
        preferred_chain VARCHAR(20) DEFAULT 'ethereum',
        wallet_connected BOOLEAN DEFAULT FALSE,
        notifications JSONB DEFAULT '{"trades": true, "snipes": true, "copyTrades": true, "priceAlerts": true, "system": true}',
        settings JSONB DEFAULT '{"autoApprove": false, "mevProtection": true, "privateMempool": true, "defaultSlippage": 1.0, "maxGasPrice": 50}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(10) NOT NULL,
        token_symbol VARCHAR(50) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        chain VARCHAR(20) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        price DECIMAL(18, 8) NOT NULL,
        total_cost DECIMAL(18, 8),
        gas_fee DECIMAL(18, 8),
        slippage DECIMAL(5, 2),
        tx_hash VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        pnl DECIMAL(18, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP
      );
    `)

    // Snipe configurations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS snipe_configs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        chain VARCHAR(20) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        max_fee DECIMAL(18, 8) NOT NULL,
        slippage DECIMAL(5, 2) NOT NULL,
        min_liquidity DECIMAL(18, 8),
        auto_sell BOOLEAN DEFAULT FALSE,
        sell_multiplier DECIMAL(5, 2),
        stop_loss DECIMAL(5, 2),
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Copy trading configurations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copy_configs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        trader_address VARCHAR(255) NOT NULL,
        trader_name VARCHAR(255),
        copy_amount DECIMAL(18, 8) NOT NULL,
        max_daily_amount DECIMAL(18, 8),
        enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Price alerts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token_symbol VARCHAR(50) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        chain VARCHAR(20) NOT NULL,
        target_price DECIMAL(18, 8) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        triggered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        triggered_at TIMESTAMP
      );
    `)

    // Bot logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // System metrics
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id SERIAL PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(18, 8) NOT NULL,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("✅ Tables created successfully")

    // Create indexes
    console.log("🔍 Creating indexes...")

    await pool.query("CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_users_chat_id ON users(chat_id);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_price_alerts_enabled ON price_alerts(enabled);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_bot_logs_type ON bot_logs(type);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_bot_logs_created_at ON bot_logs(created_at);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);")
    await pool.query("CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);")

    console.log("✅ Indexes created successfully")

    // Insert initial data
    console.log("📊 Inserting initial data...")

    // Insert admin user if ADMIN_CHAT_ID is provided
    if (process.env.ADMIN_CHAT_ID) {
      await pool.query(
        `
        INSERT INTO users (telegram_id, chat_id, username, first_name, wallet_connected, settings)
        VALUES ($1, $2, 'admin', 'Admin', false, '{"isAdmin": true, "autoApprove": true, "mevProtection": true}')
        ON CONFLICT (chat_id) DO NOTHING;
      `,
        [Number.parseInt(process.env.ADMIN_CHAT_ID), Number.parseInt(process.env.ADMIN_CHAT_ID)],
      )

      console.log("✅ Admin user created")
    }

    // Insert initial system metrics
    await pool.query(`
      INSERT INTO system_metrics (metric_name, metric_value, tags)
      VALUES 
        ('system_startup', 1, '{"version": "1.0.0", "environment": "production"}'),
        ('database_setup', 1, '{"timestamp": "${new Date().toISOString()}"}')
    `)

    console.log("✅ Initial data inserted")

    await pool.end()
    console.log("🎉 Database setup completed successfully!")

    return {
      success: true,
      message: "Database setup completed",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    throw error
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then((result) => {
      console.log("📊 Setup Result:", result)
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Setup Failed:", error)
      process.exit(1)
    })
}

module.exports = { setupDatabase }
