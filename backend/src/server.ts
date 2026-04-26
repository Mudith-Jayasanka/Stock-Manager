import express from 'express';
import cors from 'cors';
import masterDataRouter from './routes/masterData';
import productsRouter from './routes/products';
import customersRouter from './routes/customers';
import ordersRouter from './routes/orders';
import labelTemplatesRouter from './routes/labelTemplates';

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json({ limit: '10mb' })); // 10mb to handle base64 images

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/master-data', masterDataRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/label-templates', labelTemplatesRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Backend running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Using: Mock in-memory database (pre-seeded)\n`);
});
