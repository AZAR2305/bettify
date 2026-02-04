import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session';
import marketRoutes from './routes/market';
import tradeRoutes from './routes/trade';
import balanceRoutes from './routes/balance';
import stateRoutes from './routes/state';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'VaultOS',
    version: '1.0.0',
    phase: 'Phase 1 - Yellow Network Integration',
    status: 'operational',
    features: [
      'Wallet-based session management',
      'Instant prediction market trading',
      'Off-chain state channels',
      'Yield optimization',
      'Partial refunds'
    ]
  });
});

app.use('/api/session', sessionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/state', stateRoutes);

// Get all markets
app.get('/api/markets', (req, res) => {
  // This would come from MarketService
  res.json({
    success: true,
    markets: []
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VaultOS server running on http://localhost:${PORT}`);
  console.log(`📡 Yellow Network integration active`);
  console.log(`💼 Wallet-based sessions enabled`);
});

export default app;