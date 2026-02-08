/**
 * Faucet Button - Request testnet ytest.USD tokens
 * Uses Yellow Network sandbox faucet
 */
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { API_URL } from '../config/api';

interface FaucetButtonProps {
  onSuccess?: () => void;
}

const FaucetButton: React.FC<FaucetButtonProps> = ({ onSuccess }) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestTokens = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Check if session exists
      const sessionKey = `session_${address}`;
      const savedSession = localStorage.getItem(sessionKey);
      
      if (!savedSession) {
        // Allow faucet without session - just need wallet
        console.log('No session found, but proceeding with faucet request...');
      }

      // Call backend to request faucet
      const response = await fetch(`${API_URL}/api/yellow/request-faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ ${data.message || 'Success! Tokens requested from faucet'}`);
        if (onSuccess) {
          setTimeout(onSuccess, 1000); // Refresh balance after 1 second
        }
      } else if (!data.success && data.alternatives) {
        // Show manual instructions
        const manualSteps = data.alternatives[0].steps.join('\n');
        setError(`${data.message}\n\nManual method:\n${manualSteps}`);
      } else {
        setError(data.error || 'Failed to request tokens from faucet');
      }
    } catch (err: any) {
      console.error('Faucet request error:', err);
      setError(err.message || 'Network error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--accent-retro)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{
          fontSize: '1rem',
          color: 'var(--accent-retro)',
          marginBottom: '10px',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase'
        }}>
          [ TESTNET FAUCET ]
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          marginBottom: '15px',
          lineHeight: '1.5'
        }}>
          Get free ytest.USD tokens for Yellow Network sandbox testing.
          <br />
          These are testnet tokens with no real value. Use them to create markets and trade!
        </p>
      </div>

      {message && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '15px',
          color: '#22c55e',
          fontSize: '0.85rem',
          fontFamily: 'Space Mono, monospace'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '15px',
          color: '#ef4444',
          fontSize: '0.85rem',
          fontFamily: 'Space Mono, monospace'
        }}>
          ❌ {error}
        </div>
      )}

      <button
        onClick={requestTokens}
        disabled={loading || !isConnected}
        style={{
          width: '100%',
          padding: '14px',
          background: loading || !isConnected ? 'var(--text-secondary)' : 'var(--accent-retro)',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          fontFamily: 'Space Mono, monospace',
          textTransform: 'uppercase',
          cursor: loading || !isConnected ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: loading || !isConnected ? 0.6 : 1
        }}
      >
        {loading ? '[REQUESTING...]' : !isConnected ? '[CONNECT WALLET]' : '[REQUEST 1000 ytest.USD]'}
      </button>

      <div style={{
        marginTop: '15px',
        padding: '12px',
        background: 'rgba(255, 215, 0, 0.05)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: '4px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        <strong style={{ color: 'var(--accent-retro)' }}>ℹ️ Requirements:</strong>
        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
          <li>Connect wallet first</li>
          <li>Tokens deposited to off-chain ledger</li>
          <li>Can request multiple times for testing</li>
          <li>Usually arrives within 1-2 minutes</li>
        </ul>
      </div>
    </div>
  );
};

export default FaucetButton;
