import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('dolor_boost.db');

export function initDb() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Wallets Table
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      balance REAL DEFAULT 0.00,
      locked_balance REAL DEFAULT 0.00,
      currency TEXT DEFAULT 'NGN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Service Categories
    CREATE TABLE IF NOT EXISTS service_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Services
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      platform TEXT NOT NULL,
      min_quantity INTEGER NOT NULL,
      max_quantity INTEGER NOT NULL,
      price_per_1000 REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      link TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_cost REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    -- Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      wallet_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id)
    );

    -- System Logs
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL,
      component TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Goals Table
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed initial data if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const adminId = 'admin-1';
    // Password is 'DolorAdmin@2024' hashed (mocked for now, will use bcrypt in logic)
    // For seeding, we'll use a pre-hashed version or just a placeholder
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'admin@dolorboost.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', 'System Admin', 'superadmin');

    db.prepare(`INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)`).run('wallet-admin', adminId, 0);

    const categories = [
      ['cat-1', 'Instagram', 'instagram', 'Instagram', 'Followers, likes, views, reels', 1],
      ['cat-2', 'Facebook', 'facebook', 'Facebook', 'Page likes, engagement, views', 2],
      ['cat-3', 'YouTube', 'youtube', 'Youtube', 'Views, subscribers, watch time', 3],
      ['cat-4', 'TikTok', 'tiktok', 'Music2', 'Followers, views, likes', 4],
      ['cat-5', 'Twitter (X)', 'twitter', 'Twitter', 'Followers, retweets, likes', 5],
      ['cat-6', 'Telegram', 'telegram', 'Send', 'Members, views, reactions', 6],
      ['cat-7', 'Snapchat', 'snapchat', 'Ghost', 'Followers, story views', 7],
      ['cat-8', 'Website Traffic', 'traffic', 'Globe', 'Visits, SEO boost, organic', 8]
    ];

    const insertCat = db.prepare('INSERT INTO service_categories (id, name, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    categories.forEach(cat => insertCat.run(...cat));

    const services = [
      // Instagram
      ['ig-1', 'cat-1', 'Instagram Followers', 'ig-followers', 'High quality followers', 'instagram', 100, 100000, 2500, 1, 1],
      ['ig-2', 'cat-1', 'Instagram Likes', 'ig-likes', 'Instant delivery', 'instagram', 50, 50000, 800, 1, 0],
      ['ig-3', 'cat-1', 'Instagram Comments', 'ig-comments', 'Custom comments', 'instagram', 10, 5000, 4000, 1, 0],
      ['ig-4', 'cat-1', 'Instagram Reel Views', 'ig-reels', 'Fast views', 'instagram', 500, 1000000, 200, 1, 0],
      ['ig-5', 'cat-1', 'Instagram Story Views', 'ig-story', '24h active views', 'instagram', 100, 100000, 300, 1, 0],
      ['ig-6', 'cat-1', 'Instagram Saves', 'ig-saves', 'Boost algorithm', 'instagram', 100, 50000, 150, 1, 0],
      ['ig-7', 'cat-1', 'Instagram Shares', 'ig-shares', 'Post sharing', 'instagram', 50, 10000, 600, 1, 0],
      ['ig-8', 'cat-1', 'Instagram Impressions', 'ig-impressions', 'Reach boost', 'instagram', 1000, 1000000, 100, 1, 0],
      ['ig-9', 'cat-1', 'Instagram Profile Visits', 'ig-visits', 'Profile traffic', 'instagram', 100, 100000, 250, 1, 0],
      ['ig-10', 'cat-1', 'Instagram Live Views', 'ig-live', 'Real-time viewers', 'instagram', 50, 5000, 5000, 1, 0],
      
      // Facebook
      ['fb-1', 'cat-2', 'Facebook Followers', 'fb-followers', 'Profile/Page followers', 'facebook', 100, 50000, 2000, 1, 0],
      ['fb-2', 'cat-2', 'Facebook Page Likes', 'fb-page-likes', 'Page growth', 'facebook', 100, 50000, 2200, 1, 0],
      ['fb-3', 'cat-2', 'Facebook Post Likes', 'fb-likes', 'Post engagement', 'facebook', 50, 20000, 900, 1, 0],
      ['fb-4', 'cat-2', 'Facebook Post Comments', 'fb-comments', 'Custom post comments', 'facebook', 10, 5000, 3500, 1, 0],
      ['fb-5', 'cat-2', 'Facebook Video Views', 'fb-views', 'Monetization views', 'facebook', 1000, 500000, 1200, 1, 0],
      ['fb-6', 'cat-2', 'Facebook Story Views', 'fb-story', 'Active story views', 'facebook', 100, 50000, 400, 1, 0],
      ['fb-7', 'cat-2', 'Facebook Shares', 'fb-shares', 'Post sharing', 'facebook', 50, 10000, 800, 1, 0],
      ['fb-8', 'cat-2', 'Facebook Group Members', 'fb-group', 'Group growth', 'facebook', 100, 20000, 5000, 1, 0],
      ['fb-9', 'cat-2', 'Facebook Live Stream Views', 'fb-live', 'Live viewers', 'facebook', 50, 10000, 6000, 1, 0],
      
      // YouTube
      ['yt-1', 'cat-3', 'YouTube Subscribers', 'yt-subs', 'Channel growth', 'youtube', 50, 5000, 15000, 1, 1],
      ['yt-2', 'cat-3', 'YouTube Video Views', 'yt-views', 'Video views', 'youtube', 500, 1000000, 1800, 1, 0],
      ['yt-3', 'cat-3', 'YouTube Likes', 'yt-likes', 'Video likes', 'youtube', 50, 50000, 1500, 1, 0],
      ['yt-4', 'cat-3', 'YouTube Comments', 'yt-comments', 'Custom comments', 'youtube', 10, 5000, 6000, 1, 0],
      ['yt-5', 'cat-3', 'YouTube Watch Time', 'yt-watch', '4000 hours boost', 'youtube', 100, 4000, 8000, 1, 0],
      ['yt-6', 'cat-3', 'YouTube Live Stream Views', 'yt-live', 'Live viewers', 'youtube', 100, 10000, 7000, 1, 0],
      ['yt-7', 'cat-3', 'YouTube Shorts Views', 'yt-shorts', 'Shorts viral boost', 'youtube', 1000, 5000000, 500, 1, 0],
      
      // TikTok
      ['tk-1', 'cat-4', 'TikTok Followers', 'tk-followers', 'Real followers', 'tiktok', 100, 100000, 3500, 1, 0],
      ['tk-2', 'cat-4', 'TikTok Video Likes', 'tk-likes', 'Video engagement', 'tiktok', 100, 100000, 1200, 1, 0],
      ['tk-3', 'cat-4', 'TikTok Comments', 'tk-comments', 'Custom comments', 'tiktok', 10, 10000, 4500, 1, 0],
      ['tk-4', 'cat-4', 'TikTok Shares', 'tk-shares', 'Video sharing', 'tiktok', 100, 100000, 300, 1, 0],
      ['tk-5', 'cat-4', 'TikTok Video Views', 'tk-views', 'Viral boost', 'tiktok', 1000, 5000000, 150, 1, 0],
      ['tk-6', 'cat-4', 'TikTok Live Views', 'tk-live', 'Live viewers', 'tiktok', 100, 10000, 5500, 1, 0],
      ['tk-7', 'cat-4', 'TikTok Favorites', 'tk-favs', 'Save to favorites', 'tiktok', 100, 100000, 200, 1, 0],
      
      // Twitter
      ['tw-1', 'cat-5', 'Twitter Followers', 'tw-followers', 'Active followers', 'twitter', 100, 20000, 4500, 1, 0],
      ['tw-2', 'cat-5', 'Twitter Likes', 'tw-likes', 'Tweet engagement', 'twitter', 50, 20000, 1500, 1, 0],
      ['tw-3', 'cat-5', 'Twitter Retweets', 'tw-rt', 'Viral retweets', 'twitter', 20, 5000, 1200, 1, 0],
      ['tw-4', 'cat-5', 'Twitter Comments', 'tw-comments', 'Tweet replies', 'twitter', 10, 5000, 5000, 1, 0],
      ['tw-5', 'cat-5', 'Twitter Quote Tweets', 'tw-quotes', 'Quotes boost', 'twitter', 20, 5000, 2500, 1, 0],
      ['tw-6', 'cat-5', 'Twitter Video Views', 'tw-views', 'Video engagement', 'twitter', 500, 1000000, 400, 1, 0],
      ['tw-7', 'cat-5', 'Twitter Poll Votes', 'tw-votes', 'Poll participation', 'twitter', 100, 100000, 800, 1, 0],
      
      // Telegram
      ['tg-1', 'cat-6', 'Telegram Channel Members', 'tg-members', 'Channel growth', 'telegram', 100, 50000, 1500, 1, 0],
      ['tg-2', 'cat-6', 'Telegram Post Views', 'tg-views', 'Post engagement', 'telegram', 500, 1000000, 100, 1, 0],
      ['tg-3', 'cat-6', 'Telegram Reactions', 'tg-reactions', 'Emoji reactions', 'telegram', 100, 100000, 200, 1, 0],
      ['tg-4', 'cat-6', 'Telegram Comments', 'tg-comments', 'Discussion boost', 'telegram', 10, 5000, 4000, 1, 0],

      // Snapchat
      ['sc-1', 'cat-7', 'Snapchat Followers', 'sc-followers', 'Public profile followers', 'snapchat', 100, 10000, 8000, 1, 0],
      ['sc-2', 'cat-7', 'Snapchat Story Views', 'sc-views', 'Story engagement', 'snapchat', 100, 50000, 1500, 1, 0],

      // Website Traffic
      ['web-1', 'cat-8', 'Website Visits', 'web-visits', 'Direct traffic', 'traffic', 1000, 1000000, 500, 1, 0],
      ['web-2', 'cat-8', 'GEO-targeted Traffic', 'web-geo', 'Targeted by country', 'traffic', 1000, 500000, 1200, 1, 0],
      ['web-3', 'cat-8', 'Organic Traffic', 'web-organic', 'Search engine traffic', 'traffic', 1000, 500000, 1500, 1, 0],
      ['web-4', 'cat-8', 'SEO Click Boost', 'web-seo', 'Improve search ranking', 'traffic', 100, 10000, 5000, 1, 0]
    ];

    const insertSer = db.prepare('INSERT INTO services (id, category_id, name, slug, description, platform, min_quantity, max_quantity, price_per_1000, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    services.forEach(ser => insertSer.run(...ser));
  }
}

export default db;
