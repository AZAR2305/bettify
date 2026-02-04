import { Router } from 'express';
import { SessionService } from '../services/SessionService';

const router = Router();
const sessionService = new SessionService();

// Create a new trading session with wallet address
router.post('/create', async (req, res) => {
    const { walletAddress, depositAmount } = req.body;
    try {
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required' });
        }
        
        const session = await sessionService.createSession(walletAddress, depositAmount);
        res.status(201).json({ success: true, session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Close an existing trading session
router.post('/close', async (req, res) => {
    const { sessionId } = req.body;
    try {
        const result = await sessionService.closeSession(sessionId);
        res.status(200).json({ success: true, finalBalance: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get session info
router.get('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = sessionService.getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.status(200).json({ success: true, session });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router
export default router;