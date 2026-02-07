import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Trade {
  id: string;
  timestamp: string;
  market: string;
  type: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  shares: number;
  price: number;
  total: number;
}

const TradeHistory: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchTrades();
      // Refresh every 10 seconds
      const interval = setInterval(fetchTrades, 10000);
      return () => clearInterval(interval);
    } else {
      setTrades([]);
      setLoading(false);
    }
  }, [address]);

  const fetchTrades = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/trades/${address}`);
      
      if (response.ok) {
        const data = await response.json();
        const formattedTrades = data.trades.map((t: any) => ({
          id: t.id,
          timestamp: new Date(t.timestamp).toLocaleTimeString(),
          market: t.marketQuestion || t.marketId,
          type: t.type || 'BUY',
          outcome: t.outcome,
          shares: t.shares,
          price: t.price,
          total: t.shares * t.price
        }));
        setTrades(formattedTrades);
      }
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="trade-history">
        <h3>
          <span className="terminal-icon">📊</span> TRADE HISTORY
        </h3>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {'> Connect wallet to view your trade history'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-history">
      <h3>
        <span className="terminal-icon">📊</span> TRADE HISTORY
        {loading && <span style={{ fontSize: '0.75rem', marginLeft: '10px', color: 'var(--text-secondary)' }}>(refreshing...)</span>}
      </h3>

      {trades.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {'> No trades yet. Start trading to see your history!'}
          </p>
        </div>
      ) : (
        <div className="trade-table-container">
          <table className="trade-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>MARKET</th>
                <th>TYPE</th>
                <th>OUTCOME</th>
                <th>SHARES</th>
                <th>PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td>{trade.timestamp}</td>
                  <td className="market-name">{trade.market}</td>
                  <td>
                    <span className={`badge ${trade.type.toLowerCase()}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${trade.outcome.toLowerCase()}`}>
                      {trade.outcome}
                    </span>
                  </td>
                  <td>{trade.shares.toFixed(0)}</td>
                  <td>${trade.price.toFixed(2)}</td>
                  <td className="total-value">${trade.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
