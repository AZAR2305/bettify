import { Router } from 'express';
import { SessionService } from '../services/SessionService';
import { MarketService } from '../services/MarketService';

const router = Router();
const sessionService = new SessionService();
const marketService = new MarketService();

// Buy YES shares
router.post('/buy-yes', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    
    try {
        if (!sessionId || !marketId || !shares) {
            return res.status(400).json({ error: 'Missing required fields: sessionId, marketId, shares' });
        }

        // Get session
        const session = sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get market
        const market = marketService.getMarket(marketId);
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }

        // Calculate cost (simplified - would use AMM formula in production)
        const cost = parseFloat(shares);
        const currentBalance = parseFloat(session.depositAmount) - parseFloat(session.spentAmount);

        if (cost > currentBalance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Execute trade off-chain via Yellow Network (instant, zero gas)
        const stateManager = sessionService.getStateManager();
        const channelState = stateManager.getState(session.channelId);
        
        if (!channelState) {
            return res.status(500).json({ error: 'Channel state not found' });
        }

        console.log(`⚡ Executing YES trade off-chain: ${shares} shares at ${cost} USDC`);
        
        // Update spent amount
        sessionService.updateSpentAmount(sessionId, cost);

        // Update market pools
        market.yesPool = (market.yesPool || 0) + cost;
        market.totalVolume = (market.totalVolume || 0) + cost;

        const newBalance = currentBalance - cost;

        res.json({
            success: true,
            trade: {
                type: 'YES',
                shares,
                cost,
                marketId,
                timestamp: Date.now(),
            },
            balance: newBalance,
            market: {
                id: market.id,
                yesPool: market.yesPool,
                noPool: market.noPool,
                totalVolume: market.totalVolume,
            }
        });
    } catch (error: any) {
        console.error('❌ Trade error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buy NO shares
router.post('/buy-no', async (req, res) => {
    const { sessionId, marketId, shares } = req.body;
    
    try {
        if (!sessionId || !marketId || !shares) {
            return res.status(400).json({ error: 'Missing required fields: sessionId, marketId, shares' });
        }

        // Get session
        const session = sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get market
        const market = marketService.getMarket(marketId);
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }

        // Calculate cost
        const cost = parseFloat(shares);
        const currentBalance = parseFloat(session.depositAmount) - parseFloat(session.spentAmount);

        if (cost > currentBalance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Execute trade off-chain via Yellow Network (instant, zero gas)
        const stateManager = sessionService.getStateManager();
        const channelState = stateManager.getState(session.channelId);
        
        if (!channelState) {
            return res.status(500).json({ error: 'Channel state not found' });
        }

        console.log(`⚡ Executing NO trade off-chain: ${shares} shares at ${cost} USDC`);
        
        // Update spent amount
        sessionService.updateSpentAmount(sessionId, cost);

        // Update market pools
        market.noPool = (market.noPool || 0) + cost;
        market.totalVolume = (market.totalVolume || 0) + cost;

        const newBalance = currentBalance - cost;

        res.json({
            success: true,
            trade: {
                type: 'NO',
                shares,
                cost,
                marketId,
                timestamp: Date.now(),
            },
            balance: newBalance,
            market: {
                id: market.id,
                yesPool: market.yesPool,
                noPool: market.noPool,
                totalVolume: market.totalVolume,
            }
        });
    } catch (error: any) {
        console.error('❌ Trade error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sell YES shares (stub for future implementation)
router.post('/sell-yes', async (req, res) => {
    res.status(501).json({ error: 'Sell functionality coming soon' });
});

// Sell NO shares (stub for future implementation)
router.post('/sell-no', async (req, res) => {
    res.status(501).json({ error: 'Sell functionality coming soon' });
});

export default router;