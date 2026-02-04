export interface SessionKey {
    id: string;
    userId: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface Market {
    id: string;
    question: string;
    description: string;
    durationMinutes: number;
    yesPrice: number;
    noPrice: number;
    createdAt: Date;
}

export interface Trade {
    id: string;
    sessionId: string;
    marketId: string;
    shares: number;
    type: 'buy' | 'sell';
    price: number;
    createdAt: Date;
}

export interface Balance {
    active: number;
    idle: number;
    yield: number;
    total: number;
}

export interface UserState {
    sessionId: string;
    balances: Balance;
    positions: Array<{
        marketId: string;
        yesShares: number;
        noShares: number;
        invested: number;
    }>;
    refund: {
        available: boolean;
        amount: number;
    };
}