import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { API_URL } from '../config/api';

const LedgerBalanceCard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    pending: 0,
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchLedgerBalance();
      const interval = setInterval(fetchLedgerBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const fetchLedgerBalance = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/yellow/balance/${address}`);
      
      if (response.ok) {
        const data = await response.json();
        setBalance({
          total: data.total || 0,
          available: data.available || 0,
          reserved: data.reserved || 0,
          pending: data.pending || 0,
          lastUpdate: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error('Error fetching Yellow Network balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="window-frame ledger-balance-card">
        <div className="balance-header">
          {'[ OFF-CHAIN LEDGER BALANCE ]'}
          <br />
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-retro)' }}>
            {'> Powered by Yellow Network'}
          </span>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {'> Connect wallet to view balance'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="window-frame ledger-balance-card">
      <div className="balance-header">
        {'[ OFF-CHAIN LEDGER BALANCE ]'}
        <br />
        <span style={{ fontSize: '0.7rem', color: 'var(--accent-retro)' }}>
          {'> Powered by Yellow Network'}
        </span>
        <button
          onClick={fetchLedgerBalance}
          disabled={loading}
          style={{
            marginLeft: '10px',
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid var(--accent-retro)',
            color: 'var(--accent-retro)',
            fontSize: '0.65rem',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Mono, monospace'
          }}
        >
          {loading ? '⟳' : '↻ REFRESH'}
        </button>
      </div>

      <div className="balance-amount">
        {balance.total.toFixed(2)}
      </div>
      <div className="balance-label">
        YTEST.USD
      </div>

      <div className="balance-details">
        <div className="detail-item">
          <span className="detail-label">Available:</span>
          <span className="detail-value">${balance.available.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Reserved:</span>
          <span className="detail-value">${balance.reserved.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pending:</span>
          <span className="detail-value">${balance.pending.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Last Update:</span>
          <span className="detail-value">{balance.lastUpdate}</span>
        </div>
      </div>

      <div className="terminal-section" style={{ marginTop: '15px', padding: '10px', background: 'var(--bg-color)' }}>
        <div className="terminal-row">
          <span className="output" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {'> Real-time off-chain balance • Instant settlement'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LedgerBalanceCard;
