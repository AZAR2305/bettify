import { v4 as uuidv4 } from 'uuid';
import { Session } from '../types'; // Assuming you have a Session type defined in your types

class SessionService {
    private sessions: Map<string, Session>;

    constructor() {
        this.sessions = new Map();
    }

    createSession(depositAmount: number): string {
        const sessionId = uuidv4();
        const session: Session = {
            id: sessionId,
            depositAmount,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 3600000), // 1 hour expiration
            status: 'active',
        };
        this.sessions.set(sessionId, session);
        return sessionId;
    }

    getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    closeSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'closed';
            return true;
        }
        return false;
    }

    isValidSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        return session ? session.status === 'active' && session.expiresAt > new Date() : false;
    }
}

export default new SessionService();