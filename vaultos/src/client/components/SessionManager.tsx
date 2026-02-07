/**
 * Yellow Network Session Manager
 * 
 * Handles real Yellow Network authentication and session creation
 * Creates off-chain state channels for trading
 */
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Session {
  sessionId: string;
  channelId: string;
  depositAmount: string;
  createdAt: number;
  expiresAt: number;
}

interface SessionManagerProps {
  onSessionChange?: (session: Session | null) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onSessionChange }) => {
  const { address, isConnected } = useAccount();
  const [session, setSession] = useState<Session | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load existing session from localStorage
  useEffect(() => {
    if (address) {
      const savedSession = localStorage.getItem(`session_${address}`);
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        // Check if session is expired
        if (parsedSession.expiresAt > Date.now()) {
          setSession(parsedSession);
          onSessionChange?.(parsedSession);
        } else {
          localStorage.removeItem(`session_${address}`);
        }
      }
    }
  }, [address]);

  const createSession = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Create Yellow Network channel
      setStatusMessage('🔐 Connecting to Yellow Network...');
      console.log('🔐 Authenticating with Yellow Network...');
      const channelResponse = await fetch('http://localhost:3000/api/yellow/create-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address
        })
      });

      if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        throw new Error(errorData.error || 'Failed to create Yellow Network channel');
      }

      const channelData = await channelResponse.json();
      setStatusMessage('✅ Channel created! Creating session...');
      console.log('✅ Channel created:', channelData.channelId);

      // Step 2: Create trading session
      setStatusMessage('📝 Creating trading session...');
      const sessionResponse = await fetch('http://localhost:3000/api/yellow/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          channelId: channelData.channelId
        })
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const sessionData = await sessionResponse.json();
      console.log('✅ Session created:', sessionData.sessionId);

      setStatusMessage('💾 Saving session...');
      const newSession: Session = {
        sessionId: sessionData.sessionId,
        channelId: channelData.channelId,
        depositAmount,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      
      // Save to localStorage
      localStorage.setItem(`session_${address}`, JSON.stringify(newSession));
      
      setSession(newSession);
      onSessionChange?.(newSession);
      setStatusMessage('');
      
      alert(`✅ Yellow Network authenticated!\n\nChannel ID: ${channelData.channelId}\nSession ID: ${sessionData.sessionId}\n\nYou can now create markets and trade!`);
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      setStatusMessage('');
      alert(`Failed to authenticate with Yellow Network:\n\n${error.message}`);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const closeSession = () => {
    if (confirm('Close trading session and settle?')) {
      if (address) {
        localStorage.removeItem(`session_${address}`);
      }
      setSession(null);
      onSessionChange?.(null);
    }
  };

  return (
    <div className="session-manager">
      <h2>[ SESSION_MANAGER ]</h2>
      
      <div style={{ padding: '20px' }}>
        {!session ? (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
              {'> Authenticate with Yellow Network to trade'}
            </p>
            
            {statusMessage && (
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid var(--accent-retro)',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '0.8rem',
                textAlign: 'center',
                color: 'var(--accent-retro)',
                fontFamily: 'Space Mono, monospace'
              }}>
                {statusMessage}
              </div>
            )}
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>DEPOSIT (USDC):</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="input"
                disabled={!isConnected}
                style={{ textAlign: 'center' }}
              />
            </div>

            <div className="compact-options">
              <div
                onClick={() => !loading && isConnected && createSession()}
                className={`option-card clickable ${(loading || !isConnected) ? 'disabled' : ''}`}
              >
                <div className="option-label">{loading ? '[AUTHENTICATING...]' : '[AUTHENTICATE YELLOW NETWORK]'}</div>
              </div>
            </div>

            {!isConnected && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem', 
                marginTop: '10px',
                textAlign: 'center'
              }}>
                {'> Connect wallet to authenticate'}
              </p>
            )}

            <p style={{ 
              color: 'var(--accent-retro)', 
              fontSize: '0.7rem', 
              marginTop: '15px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {'> Creates real Yellow Network channel & session'}
            </p>
          </>
        ) : (
          <>
            <div className="session-card">
              <p style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-retro)' }}>SESSION_ID:</span>
                <br />
                <span style={{ fontSize: '0.75rem' }}>
                  {session.sessionId.substring(0, 20)}...
                </span>
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-retro)' }}>CHANNEL:</span>
                <br />
                <span style={{ fontSize: '0.75rem' }}>{session.channelId}</span>
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-retro)' }}>DEPOSIT:</span> ${session.depositAmount} USDC
              </p>
              <p style={{ fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--accent-retro)' }}>EXPIRES:</span>{' '}
                {new Date(session.expiresAt).toLocaleString()}
              </p>
            </div>

            <div className="compact-options" style={{ marginTop: '15px' }}>
              <div
                onClick={closeSession}
                className="option-card clickable secondary"
              >
                <div className="option-label">[CLOSE SESSION]</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionManager;
