import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Session {
  sessionId: string;
  channelId: string;
  depositAmount: string;
  createdAt: number;
  expiresAt: number;
  spentAmount: string;
}

const SessionManager: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [session, setSession] = useState<Session | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load existing session
  useEffect(() => {
    const loadSession = async () => {
      if (!address) return;
      
      try {
        const savedSession = localStorage.getItem(`session_${address}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          // Check if session is still valid
          if (parsed.expiresAt > Date.now()) {
            setSession(parsed);
          } else {
            localStorage.removeItem(`session_${address}`);
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
      }
    };

    loadSession();
  }, [address]);

  const createSession = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          depositAmount: parseFloat(depositAmount),
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      setSession(data.session);
      
      // Save to localStorage
      localStorage.setItem(`session_${address}`, JSON.stringify(data.session));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) throw new Error('Failed to close session');

      const data = await response.json();
      alert(`Session closed! Final balance: ${data.finalBalance} USDC`);
      
      setSession(null);
      if (address) {
        localStorage.removeItem(`session_${address}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="session-manager">
        <p className="info-message">👆 Please connect your wallet to create a session</p>
      </div>
    );
  }

  return (
    <div className="session-manager">
      <h2>🎮 Trading Session</h2>
      
      {!session ? (
        <div className="create-session">
          <p>Create a session to start trading</p>
          <div className="input-group">
            <label>Deposit Amount (USDC):</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="10"
              step="10"
              className="input"
            />
          </div>
          <button
            onClick={createSession}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : '🚀 Create Session'}
          </button>
          <p className="info-text">
            ✅ Session wallet with limited permissions<br />
            ✅ Instant off-chain trading<br />
            ✅ Up to 25% refundable
          </p>
        </div>
      ) : (
        <div className="session-info">
          <div className="session-card">
            <p><strong>Session ID:</strong> {session.sessionId.slice(0, 20)}...</p>
            <p><strong>Deposit:</strong> {session.depositAmount} USDC</p>
            <p><strong>Spent:</strong> {session.spentAmount} USDC</p>
            <p><strong>Expires:</strong> {new Date(session.expiresAt).toLocaleTimeString()}</p>
          </div>
          <button
            onClick={closeSession}
            disabled={loading}
            className="btn btn-danger"
          >
            {loading ? 'Closing...' : 'Close Session & Settle'}
          </button>
        </div>
      )}

      {error && <p className="error-message">❌ {error}</p>}
    </div>
  );
};

export default SessionManager;
