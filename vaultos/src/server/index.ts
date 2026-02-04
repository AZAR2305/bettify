import express from 'express';
import sessionRoutes from './routes/session';
import marketRoutes from './routes/market';
import tradeRoutes from './routes/trade';
import balanceRoutes from './routes/balance';
import stateRoutes from './routes/state';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/session', sessionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/state', stateRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});