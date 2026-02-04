export interface SessionKey {
  id: string;
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
  marketId: string;
  sessionId: string;
  shares: number;
  type: 'buy' | 'sell';
  price: number;
  createdAt: Date;
}

export interface Balance {
  active: number;
  idle: number;
  yield: number;
}

export interface UserState {
  sessionId: string;
  balances: Balance;
  positions: Trade[];
  refund: {
    available: boolean;
    amount: number;
  };
}