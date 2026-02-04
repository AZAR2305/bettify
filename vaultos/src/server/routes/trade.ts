import { Router } from 'express';
import { TradeService } from '../services/TradeService';
import { SessionService } from '../services/SessionService';

const router = Router();
const tradeService = new TradeService();
const sessionService = new SessionService();

// Buy YES shares
router.post('/buy-yes', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    try {
        const result = await tradeService.buyYesShares(sessionId, marketId, shares);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buy NO shares
router.post('/buy-no', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    try {
        const result = await tradeService.buyNoShares(sessionId, marketId, shares);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sell YES shares
router.post('/sell-yes', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    try {
        const result = await tradeService.sellYesShares(sessionId, marketId, shares);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sell NO shares
router.post('/sell-no', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    try {
        const result = await tradeService.sellNoShares(sessionId, marketId, shares);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;