import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Trade {
  marketId: string;
  shares: number;
  type: 'yes' | 'no';
}

interface Market {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
}

const TradePanelNew: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [shares, setShares] = useState<number>(100);
  const [tradeType, setTradeType] = useState<'buy-yes' | 'buy-no' | 'sell-yes' | 'sell-no'>('buy-yes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const response = await fetch('/api/markets');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
        if (data.markets?.length > 0) {
          setSelectedMarket(data.markets[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading markets:', err);
    }
  };

  const executeTrade = async () => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    const sessionId = localStorage.getItem(`session_${address}`);
    if (!sessionId) {
      setError('Please create a trading session first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = JSON.parse(sessionId);
      const response = await fetch(`/api/trade/${tradeType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          marketId: selectedMarket,
          shares,
        }),
      });

      if (!response.ok) throw new Error('Trade failed');

      const data = await response.json();
      alert(`Trade successful! Cost: ${data.cost} USDC`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMarketData = markets.find((m) => m.id === selectedMarket);
  const price = selectedMarketData 
    ? (tradeType.includes('yes') ? selectedMarketData.yesPrice : selectedMarketData.noPrice)
    : 0;
  const totalCost = shares * price;

  return (
    <div className="trade-panel">
      <h2>💱 Trade</h2>

      {markets.length === 0 ? (
        <p className="info-message">No markets available. Create one first!</p>
      ) : (
        <div className="trade-form">
          <div className="input-group">
            <label>Select Market:</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="input"
            >
              {markets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.question}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Trade Type:</label>
            <div className="trade-buttons">
              <button
                className={`trade-btn ${tradeType === 'buy-yes' ? 'active yes' : ''}`}
                onClick={() => setTradeType('buy-yes')}
              >
                Buy YES
              </button>
              <button
                className={`trade-btn ${tradeType === 'buy-no' ? 'active no' : ''}`}
                onClick={() => setTradeType('buy-no')}
              >
                Buy NO
              </button>
              <button
                className={`trade-btn ${tradeType === 'sell-yes' ? 'active yes' : ''}`}
                onClick={() => setTradeType('sell-yes')}
              >
                Sell YES
              </button>
              <button
                className={`trade-btn ${tradeType === 'sell-no' ? 'active no' : ''}`}
                onClick={() => setTradeType('sell-no')}
              >
                Sell NO
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Shares:</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(parseInt(e.target.value) || 0)}
              min="1"
              className="input"
            />
          </div>

          <div className="trade-summary">
            <p><strong>Price per share:</strong> ${price.toFixed(2)}</p>
            <p><strong>Total cost:</strong> ${totalCost.toFixed(2)} USDC</p>
          </div>

          <button
            onClick={executeTrade}
            disabled={loading || !isConnected}
            className="btn btn-primary btn-large"
          >
            {loading ? 'Processing...' : `⚡ Execute Trade`}
          </button>

          {error && <p className="error-message">❌ {error}</p>}
        </div>
      )}
    </div>
  );
};

export default TradePanelNew;
