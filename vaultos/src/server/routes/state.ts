import { Router } from 'express';
import { getState } from '../services/SessionService';

const router = Router();

// Route to get the current state of the user's session
router.get('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const state = await getState(sessionId);
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;