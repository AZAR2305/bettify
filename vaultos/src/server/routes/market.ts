import { Router } from 'express';
import { MarketService } from '../services/MarketService';
import { validateMarketCreation } from '../middlewares/validation';

const router = Router();
const marketService = new MarketService();

// Route to create a new prediction market
router.post('/create', validateMarketCreation, async (req, res) => {
    try {
        const marketData = req.body;
        const market = await marketService.createMarket(marketData);
        res.status(201).json(market);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get all active markets
router.get('/', async (req, res) => {
    try {
        const markets = await marketService.getActiveMarkets();
        res.status(200).json(markets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get market details by ID
router.get('/:marketId', async (req, res) => {
    try {
        const { marketId } = req.params;
        const market = await marketService.getMarketById(marketId);
        if (market) {
            res.status(200).json(market);
        } else {
            res.status(404).json({ error: 'Market not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router
export default router;