import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Market {
  id: string;
  question: string;
  description: string;
  yesPrice: number;
  noPrice: number;
  endTime: number;
  totalVolume: number;
}

const MarketListNew: React.FC = () => {
  const { isConnected } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMarket, setNewMarket] = useState({
    question: '',
    description: '',
    durationMinutes: 30,
    yesPrice: 0.5,
  });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/markets');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
      }
    } catch (err) {
      console.error('Error loading markets:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMarket = async () => {
    if (!newMarket.question) {
      alert('Please enter a question');
      return;
    }

    try {
      const response = await fetch('/api/market/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMarket),
      });

      if (response.ok) {
        setNewMarket({ question: '', description: '', durationMinutes: 30, yesPrice: 0.5 });
        setShowCreate(false);
        loadMarkets();
      }
    } catch (err) {
      console.error('Error creating market:', err);
    }
  };

  return (
    <div className="market-list">
      <div className="market-header">
        <h2>📊 Prediction Markets</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : '➕ Create Market'}
        </button>
      </div>

      {showCreate && (
        <div className="create-market-form">
          <h3>Create New Market</h3>
          <div className="input-group">
            <label>Question:</label>
            <input
              type="text"
              value={newMarket.question}
              onChange={(e) => setNewMarket({ ...newMarket, question: e.target.value })}
              placeholder="Will BTC reach $150k by June 2026?"
              className="input"
            />
          </div>
          <div className="input-group">
            <label>Description:</label>
            <textarea
              value={newMarket.description}
              onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
              placeholder="Market resolves YES if..."
              className="input"
              rows={3}
            />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Duration (minutes):</label>
              <input
                type="number"
                value={newMarket.durationMinutes}
                onChange={(e) => setNewMarket({ ...newMarket, durationMinutes: parseInt(e.target.value) })}
                min="5"
                className="input"
              />
            </div>
            <div className="input-group">
              <label>YES Price (0-1):</label>
              <input
                type="number"
                value={newMarket.yesPrice}
                onChange={(e) => setNewMarket({ ...newMarket, yesPrice: parseFloat(e.target.value) })}
                min="0.01"
                max="0.99"
                step="0.01"
                className="input"
              />
            </div>
          </div>
          <button onClick={createMarket} className="btn btn-primary">
            🚀 Create Market
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading markets...</p>
      ) : markets.length === 0 ? (
        <div className="empty-state">
          <p>No markets yet. Create the first one!</p>
        </div>
      ) : (
        <div className="markets-grid">
          {markets.map((market) => (
            <div key={market.id} className="market-card">
              <h3>{market.question}</h3>
              <p className="market-description">{market.description}</p>
              <div className="market-prices">
                <div className="price-box yes">
                  <span className="label">YES</span>
                  <span className="price">${(market.yesPrice * 100).toFixed(0)}¢</span>
                </div>
                <div className="price-box no">
                  <span className="label">NO</span>
                  <span className="price">${(market.noPrice * 100).toFixed(0)}¢</span>
                </div>
              </div>
              <div className="market-info">
                <span>📈 Volume: ${market.totalVolume.toFixed(2)}</span>
                <span>⏱️ Ends: {new Date(market.endTime).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketListNew;
