import { Router } from 'express';
import { SessionService } from '../services/SessionService';

const router = Router();
const sessionService = new SessionService();

// Create a new trading session
router.post('/create', async (req, res) => {
    const { depositAmount } = req.body;
    try {
        const session = await sessionService.createSession(depositAmount);
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Close an existing trading session
router.post('/close', async (req, res) => {
    const { sessionId } = req.body;
    try {
        const result = await sessionService.closeSession(sessionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router
export default router;