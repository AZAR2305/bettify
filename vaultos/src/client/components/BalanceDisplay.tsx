import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Balance {
  active: number;
  idle: number;
  yield: number;
  total: number;
}

const BalanceDisplay: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<Balance>({ active: 0, idle: 0, yield: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const fetchBalance = async () => {
    if (!address) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/balance/address/${address}`);
      if (response.ok) {
        const data = await response.json();
        setBalance({
          active: data.activeTrading || 0,
          idle: data.idle || 0,
          yield: data.yieldEarned || 0,
          total: data.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-display">
      <h2>[ BALANCE_INFO ]</h2>
      
      <div style={{ padding: '20px' }}>
        {!isConnected ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
            {'> Connect wallet to view balance'}
          </p>
        ) : (
          <>
            <div className="balance-card">
              <div className="balance-item">
                <span>ACTIVE TRADING:</span>
                <strong>${balance.active.toFixed(2)}</strong>
              </div>
              <div className="balance-item">
                <span>IDLE (5% APR):</span>
                <strong>${balance.idle.toFixed(2)}</strong>
              </div>
              <div className="balance-item">
                <span>YIELD EARNED:</span>
                <strong style={{ color: '#4ade80' }}>+${balance.yield.toFixed(2)}</strong>
              </div>
              <div className="balance-total">
                <span>TOTAL:</span>
                <strong>${balance.total.toFixed(2)}</strong>
              </div>
            </div>

            {loading && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '10px' }}>
                {'> Refreshing balance...'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceDisplay;
