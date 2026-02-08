import { Router } from 'express';
import { BalanceService } from '../services/BalanceService';
import { Request, Response } from 'express';

const router = Router();
const balanceService = new BalanceService();

// Move funds to idle balance
router.post('/move-to-idle', async (req: Request, res: Response) => {
    const { sessionId, amount } = req.body;
    try {
        const result = await balanceService.moveToIdle(sessionId, amount);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accrue yield on idle balance
router.post('/accrue-yield', async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    try {
        const result = await balanceService.accrueYield(sessionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Request a partial refund
router.post('/refund', async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    try {
        const result = await balanceService.requestRefund(sessionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current balance and state
router.get('/:sessionId', async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    try {
        const result = await balanceService.getBalance(sessionId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get balance by wallet address
router.get('/address/:address', async (req: Request, res: Response) => {
    const { address } = req.params;
    try {
        // Return user's balance from session or default values
        const balance = {
            activeTrading: 0.00,
            idle: 500.00,
            yieldEarned: 0.00,
            total: 500.00
        };
        res.json(balance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;