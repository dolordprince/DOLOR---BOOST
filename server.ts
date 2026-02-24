import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initDb } from './src/db/database.ts';
import db from './src/db/database.ts';
import { GoogleGenAI } from "@google/genai";
import cron from 'node-cron';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Initialize Database
initDb();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development with Vite
}));
app.use(cors());
app.use(express.json());

// --- API Routes ---

// Auth
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const userId = `user-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 12);

    const createUser = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, email, passwordHash, fullName, 'user');

      db.prepare(`INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)`).run(`wallet-${Date.now()}`, userId, 0);
    });

    createUser();

    const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: userId, email, fullName, role: 'user' } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Services
app.get('/api/v1/services', (req, res) => {
  const services = db.prepare(`
    SELECT s.*, c.name as category_name 
    FROM services s 
    LEFT JOIN service_categories c ON s.category_id = c.id 
    WHERE s.is_active = 1
  `).all();
  res.json(services);
});

app.get('/api/v1/services/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM service_categories WHERE is_active = 1 ORDER BY sort_order').all();
  res.json(categories);
});

// Orders (Protected)
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/v1/orders', authenticate, (req: any, res) => {
  const { serviceId, link, quantity } = req.body;
  const userId = req.user.id;

  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId) as any;
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const totalCost = (service.price_per_1000 / 1000) * quantity;
    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;

    if (wallet.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const orderId = `order-${Date.now()}`;
    const orderNumber = `DB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;

    const transaction = db.transaction(() => {
      // Deduct balance
      db.prepare('UPDATE wallets SET balance = balance - ? WHERE user_id = ?').run(totalCost, userId);
      
      // Create order
      db.prepare(`
        INSERT INTO orders (id, order_number, user_id, service_id, link, quantity, total_cost, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(orderId, orderNumber, userId, serviceId, link, quantity, totalCost, 'pending');

      // Log transaction
      db.prepare(`
        INSERT INTO transactions (id, user_id, wallet_id, type, amount, balance_before, balance_after, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(`tx-${Date.now()}`, userId, wallet.id, 'order_payment', totalCost, wallet.balance, wallet.balance - totalCost, `Order #${orderNumber}`);
    });

    transaction();
    res.json({ success: true, orderNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Order failed' });
  }
});

app.get('/api/v1/orders', authenticate, (req: any, res) => {
  const orders = db.prepare(`
    SELECT o.*, s.name as service_name 
    FROM orders o 
    JOIN services s ON o.service_id = s.id 
    WHERE o.user_id = ? 
    ORDER BY o.created_at DESC
  `).all(req.user.id);
  res.json({ orders });
});

// Wallet
app.get('/api/v1/wallet', authenticate, (req: any, res) => {
  const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
  res.json(wallet);
});

app.get('/api/v1/transactions', authenticate, (req: any, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(transactions);
});

// Goals
app.get('/api/v1/goals', authenticate, (req: any, res) => {
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(goals);
});

app.post('/api/v1/goals', authenticate, (req: any, res) => {
  const { name, platform, targetValue } = req.body;
  const userId = req.user.id;
  try {
    const goalId = `goal-${Date.now()}`;
    db.prepare(`
      INSERT INTO goals (id, user_id, name, platform, target_value)
      VALUES (?, ?, ?, ?, ?)
    `).run(goalId, userId, name, platform, targetValue);
    res.json({ success: true, goalId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.delete('/api/v1/goals/:id', authenticate, (req: any, res) => {
  try {
    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Order Status Update (Simulated Completion)
app.patch('/api/v1/orders/:id/status', authenticate, (req: any, res) => {
  const { status } = req.body;
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, userId) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, orderId);

    if (status === 'completed') {
      const service = db.prepare('SELECT * FROM services WHERE id = ?').get(order.service_id) as any;
      if (service) {
        // Update goals for this platform
        db.prepare(`
          UPDATE goals 
          SET current_value = current_value + ?, 
              updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = ? AND platform = ? AND status = 'active'
        `).run(order.quantity, userId, service.platform);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.post('/api/v1/wallet/fund', authenticate, (req: any, res) => {
  const { amount } = req.body;
  const userId = req.user.id;
  try {
    const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as any;
    db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(amount, userId);
    
    db.prepare(`
      INSERT INTO transactions (id, user_id, wallet_id, type, amount, balance_before, balance_after, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`tx-${Date.now()}`, userId, wallet.id, 'deposit', amount, wallet.balance, wallet.balance + amount, 'Manual Funding');

    res.json({ success: true, newBalance: wallet.balance + amount });
  } catch (error) {
    res.status(500).json({ error: 'Funding failed' });
  }
});

// AI Monitor (Gemini Integration)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAiMonitor() {
  console.log('🤖 AI Monitor running...');
  try {
    const stalledOrders = db.prepare("SELECT * FROM orders WHERE status = 'pending' AND created_at < datetime('now', '-1 hour')").all() as any[];
    
    if (stalledOrders.length > 0) {
      const prompt = `I have ${stalledOrders.length} orders that have been stuck in 'pending' status for over an hour. 
      Order IDs: ${stalledOrders.map(o => o.order_number).join(', ')}.
      What should be the automated action? (e.g., retry, alert admin, mark as failed). 
      Provide a brief summary of the situation for the system logs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const aiAdvice = response.text;
      
      db.prepare(`
        INSERT INTO system_logs (id, level, component, message)
        VALUES (?, ?, ?, ?)
      `).run(`log-${Date.now()}`, 'info', 'ai-monitor', `AI Advice for stalled orders: ${aiAdvice}`);

      console.log('AI Advice:', aiAdvice);
    }
  } catch (error) {
    console.error('AI Monitor error:', error);
  }
}

cron.schedule('*/5 * * * *', runAiMonitor);

// --- Vite Integration ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
