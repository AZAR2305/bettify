export class TradeService {
    private sessions: Map<string, any>;
    private markets: Map<string, any>;

    constructor() {
        this.sessions = new Map();
        this.markets = new Map();
    }

    // Helper to get market by ID
    private getMarket(marketId: string) {
        return this.markets.get(marketId);
    }

    // Register a market
    registerMarket(marketId: string, marketData: any) {
        this.markets.set(marketId, marketData);
    }

    // Register a session
    registerSession(sessionId: string, sessionData: any) {
        this.sessions.set(sessionId, sessionData);
    }

    async buyYesShares(sessionId: string, marketId: string, shares: number): Promise<Trade> {
        const session = await this.sessionService.getSession(sessionId);
        const market = await this.marketService.getMarket(marketId);

        if (!session || !market) {
            throw new Error('Invalid session or market');
        }

        const cost = shares * market.yesPrice;
        if (session.activeBalance < cost) {
            throw new Error('Insufficient balance');
        }

        session.activeBalance -= cost;
        session.positions.push(new UserPosition(marketId, shares, 0));
        await this.sessionService.updateSession(session);

        return { sessionId, marketId, shares, type: 'buy-yes', cost };
    }

    async sellYesShares(sessionId: string, marketId: string, shares: number): Promise<Trade> {
        const session = await this.sessionService.getSession(sessionId);
        const market = await this.marketService.getMarket(marketId);

        if (!session || !market) {
            throw new Error('Invalid session or market');
        }

        const position = session.positions.find(pos => pos.marketId === marketId);
        if (!position || position.yesShares < shares) {
            throw new Error('Insufficient YES shares to sell');
        }

        const revenue = shares * market.yesPrice;
        position.yesShares -= shares;
        session.activeBalance += revenue;
        await this.sessionService.updateSession(session);
        return { sessionId, marketId, shares, type: 'sell-yes', revenue };
    }

    async buyNoShares(sessionId: string, marketId: string, shares: number): Promise<Trade> {
        const session = await this.sessionService.getSession(sessionId);
        const market = await this.marketService.getMarket(marketId);

        if (!session || !market) {
            throw new Error('Invalid session or market');
        }

        const cost = shares * market.noPrice;
        if (session.activeBalance < cost) {
            throw new Error('Insufficient balance');
        }

        session.activeBalance -= cost;
        const position = session.positions.find(pos => pos.marketId === marketId) || new UserPosition(marketId, 0, 0);
        position.noShares += shares;
        if (!session.positions.includes(position)) {
            session.positions.push(position);
        }
        await this.sessionService.updateSession(session);

        return { sessionId, marketId, shares, type: 'buy-no', cost };
    }
}