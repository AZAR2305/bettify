/**
 * Trade History API Routes
 * Returns user's trading history across all markets
 */
import { Router, Request, Response } from 'express';
import marketService from '../services/MarketService';

const router = Router();

/**
 * GET /api/trades/:address
 * Get all trades for a specific wallet address
 */
router.get('/:address', async (req: Request, res: Response) => {
    const { address } = req.params;

    if (!address) {
        return res.status(400).json({ 
            success: false,
            error: 'Wallet address is required' 
        });
    }

    try {
        // Get all active markets
        const markets = marketService.getActiveMarkets();
        
        // Collect all trades from all markets for this user
        const allTrades: any[] = [];
        
        markets.forEach((market: any) => {
            // Defensive check: ensure positions Map exists
            if (!market.positions || !(market.positions instanceof Map)) {
                console.warn(`⚠️ Market ${market.id} has no positions Map`);
                return;
            }

            const positions = market.positions.get(address);
            if (positions) {
                // For each position, add trade records
                if (positions.YES && positions.YES.shares > 0) {
                    allTrades.push({
                        id: `${market.id}_YES_${Date.now()}`,
                        marketId: market.id,
                        marketQuestion: market.question,
                        userAddress: address,
                        outcome: 'YES',
                        shares: positions.YES.shares,
                        price: positions.YES.averagePrice,
                        totalCost: positions.YES.totalCost,
                        timestamp: positions.YES.timestamp || Date.now() - 3600000, // Mock: 1 hour ago
                        type: 'BUY'
                    });
                }
                
                if (positions.NO && positions.NO.shares > 0) {
                    allTrades.push({
                        id: `${market.id}_NO_${Date.now()}`,
                        marketId: market.id,
                        marketQuestion: market.question,
                        userAddress: address,
                        outcome: 'NO',
                        shares: positions.NO.shares,
                        price: positions.NO.averagePrice,
                        totalCost: positions.NO.totalCost,
                        timestamp: positions.NO.timestamp || Date.now() - 7200000, // Mock: 2 hours ago
                        type: 'BUY'
                    });
                }
            }
        });

        // Sort by timestamp (newest first)
        allTrades.sort((a, b) => b.timestamp - a.timestamp);

        res.json({
            success: true,
            trades: allTrades,
            count: allTrades.length
        });

    } catch (error: any) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch trade history'
        });
    }
});

export default router;
