export interface Session {
    sessionId: string;
    depositAmount: number;
    createdAt: Date;
    expiresAt: Date;
}

export interface Market {
    marketId: string;
    question: string;
    description: string;
    durationMinutes: number;
    yesPrice: number;
    noPrice: number;
    createdAt: Date;
}

export interface Trade {
    tradeId: string;
    sessionId: string;
    marketId: string;
    shares: number;
    tradeType: 'buy' | 'sell';
    price: number;
    createdAt: Date;
}

export interface Balance {
    active: number;
    idle: number;
    yield: number;
    total: number;
}

export interface Position {
    marketId: string;
    yesShares: number;
    noShares: number;
    invested: number;
}

export interface State {
    channelId: string;
    balances: Balance;
    positions: Position[];
    refund: {
        available: boolean;
        amount: number;
    };
    version: {
        nonce: number;
        signatures: number;
    };
}