/**
 * Yellow Network Session Manager
 * 
 * Handles OFF-CHAIN state channel creation:
 * 1. User deposits USDC → ON-CHAIN lock
 * 2. Yellow node opens state channel → OFF-CHAIN
 * 3. All trades happen OFF-CHAIN (instant, gasless)
 * 4. Close session → ON-CHAIN settlement
 * 
 * Session lifecycle:
 * - Create: Lock funds in Yellow smart contract
 * - Trade: Off-chain state updates (< 100ms)
 * - Close: Final settlement on-chain
 */
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useSignMessage } from 'wagmi';
import { formatUnits } from 'viem';

// ytest.USD token on Base Sepolia
const YTEST_USD_TOKEN = '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb';
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface Session {
  sessionId: string;
  channelId: string;
  depositAmount: string;
  createdAt: number;
  expiresAt: number;
  spentAmount: string;
  walletAddress: string;
}

interface SessionManagerProps {
  onSessionChange?: (session: Session | null) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onSessionChange }) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  // Check ytest.USD balance
  const { data: ytestBalance, refetch: refetchBalance } = useReadContract({
    address: YTEST_USD_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const [session, setSession] = useState<Session | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [creatingStep, setCreatingStep] = useState<number>(0);
  const [additionalDeposit, setAdditionalDeposit] = useState<string>('100');
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<string>('');

  // Format balance for display
  const formattedBalance = ytestBalance 
    ? parseFloat(formatUnits(ytestBalance as bigint, 6)).toFixed(2)
    : '0.00';

  // Load existing session
  useEffect(() => {
    const loadSession = async () => {
      if (!address) return;
      
      try {
        const savedSession = localStorage.getItem(`session_${address}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          
          // Check if session key expired (not channel!)
          if (parsed.expiresAt > Date.now()) {
            setSession(parsed);
            console.log('✅ Session restored from localStorage');
          } else {
            // Session key expired, but channel may still exist
            console.log('⚠️  Session key expired - channel may still exist');
            console.log('   To resume: Click "Reconnect Session" (generate new session key)');
            localStorage.removeItem(`session_${address}`);
            
            // Store channel ID for potential recovery
            if (parsed.channelId) {
              localStorage.setItem(`channel_${address}`, parsed.channelId);
              setError('Session expired. Click "Reconnect Session" to resume your channel.');
            }
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

    // Check ytest.USD balance
    const balanceNum = parseFloat(formattedBalance);
    const depositNum = parseFloat(depositAmount);
    
    if (balanceNum < depositNum) {
      setError(`Insufficient ytest.USD balance. You have ${formattedBalance} but need ${depositAmount}`);
      setFaucetMessage('💡 Click the "Get Testnet ytest.USD" button above to get tokens');
      return;
    }

    setLoading(true);
    setError('');
    setCreatingStep(1);

    try {
      // Request permission to connect to Yellow Network
      const message = `Connect to Yellow Network\n\nWallet: ${address}\nDeposit: ${depositAmount} ytest.USD\nTimestamp: ${Date.now()}`;
      
      console.log('🔐 Requesting signature to connect to Yellow Network...');
      await signMessageAsync({ message });
      console.log('✅ Permission granted');

      // Check for existing channel to resume
      const existingChannelId = localStorage.getItem(`channel_${address}`);
      if (existingChannelId) {
        console.log(`🔄 Attempting to resume existing channel: ${existingChannelId}`);
        setCreatingStep(2);
      } else {
        // Step 1: Lock funds on-chain (simulated)
        setCreatingStep(1);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCreatingStep(2);
      }
      
      // Step 2: Open/Resume Yellow Network state channel
      const response = await fetch('http://localhost:3000/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          depositAmount: parseFloat(depositAmount),
          existingChannelId, // Pass existing channel to resume
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      
      // Step 3: Initialize off-chain state
      setCreatingStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessionData = {
        ...data.session,
        spentAmount: '0',
        walletAddress: address
      };
      
      setSession(sessionData);
      if (onSessionChange) onSessionChange(sessionData);
      
      // Save session to localStorage
      localStorage.setItem(`session_${address}`, JSON.stringify(sessionData));
      
      // Save channel ID separately for recovery
      if (sessionData.channelId) {
        localStorage.setItem(`channel_${address}`, sessionData.channelId);
      }
      
      console.log('✅ Session created:');
      console.log('   Session ID (ephemeral):', sessionData.sessionId);
      console.log('   Channel ID (persistent):', sessionData.channelId);
      
      setCreatingStep(0);
    } catch (err: any) {
      setError(err.message);
      setCreatingStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!session) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/balance/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          amount: parseFloat(additionalDeposit),
        }),
      });

      if (!response.ok) throw new Error('Deposit failed');

      const data = await response.json();
      
      // Update session with new balance
      const updatedSession = {
        ...session,
        depositAmount: data.newBalance.toString()
      };
      
      setSession(updatedSession);
      if (onSessionChange) onSessionChange(updatedSession);
      localStorage.setItem(`session_${address}`, JSON.stringify(updatedSession));
      
      alert(`✅ Deposited ${additionalDeposit} USDC off-chain!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw via API endpoint: POST /api/balance/withdraw
  // Test with: curl -X POST http://localhost:3000/api/balance/withdraw -H "Content-Type: application/json" -d '{"sessionId":"...","amount":100}'

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

  const requestFaucetTokens = async () => {
    if (!address) {
      setFaucetMessage('⚠️ Please connect your wallet first');
      return;
    }

    setFaucetLoading(true);
    setFaucetMessage('Checking faucet availability...');

    try {
        // Refetch balance after successful faucet request
        setTimeout(() => {
          refetchBalance();
        }, 5000);
      const response = await fetch('http://localhost:3000/api/yellow/request-faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFaucetMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setFaucetMessage('💡 Refresh your wallet in 1-2 minutes to see tokens');
        }, 3000);
      } else {
        // Show manual faucet link
        setFaucetMessage(`❌ ${data.error || data.message || 'Faucet unavailable'}`);
        setTimeout(() => {
          setFaucetMessage('💡 Use manual faucet: https://clearnet-sandbox.yellow.com');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Faucet error:', err);
      setFaucetMessage('❌ Error: Automatic faucet unavailable');
      setTimeout(() => {
        setFaucetMessage('💡 Use manual faucet: https://clearnet-sandbox.yellow.com');
      }, 2000);
    } finally {
      setFaucetLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="session-section">
        <div className="session-locked">
          <div className="lock-icon">🔒</div>
          <p className="lock-message">Connect wallet to start trading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-section">
      <h2>Yellow Network Session</h2>
      
      {!session ? (
        <div className="session-create">
          <div className="yellow-flow">
            <div className="flow-badge on-chain">ON-CHAIN</div>
            <div className="flow-arrow">↓</div>
            <div className="flow-badge off-chain">OFF-CHAIN</div>
          </div>

          <p className="session-description">
            Create a Yellow Network state channel for instant, gasless trading
          </p>

          {/* ytest.USD Balance Display */}
          <div className="balance-display" style={{ 
            marginBottom: '15px', 
            padding: '12px', 
            background: '#1a1f35', 
            borderRadius: '8px',
            border: '1px solid #2a3f5f'
          }}>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>Your ytest.USD Balance:</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: parseFloat(formattedBalance) >= parseFloat(depositAmount) ? '#4CAF50' : '#FFD700' 
            }}>
              {formattedBalance} <span style={{ fontSize: '14px', color: '#888' }}>ytest.USD</span>
            </div>
            {parseFloat(formattedBalance) < parseFloat(depositAmount) && (
              <div style={{ fontSize: '12px', color: '#FFD700', marginTop: '5px' }}>
                ⚠️ Insufficient balance for deposit
              </div>
            )}
          </div>

          {/* Faucet Button */}
          <div className="faucet-section" style={{ marginBottom: '20px', padding: '15px', background: '#16213e', borderRadius: '0px', border: '2px solid #FFD700' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#FFD700' }}>Need testnet ytest.USD?</div>
            <button
              onClick={requestFaucetTokens}
              disabled={faucetLoading}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {faucetLoading ? 'Requesting...' : '💰 Get Testnet ytest.USD'}
            </button>
            {faucetMessage && (
              <div style={{ 
                fontSize: '13px', 
                color: faucetMessage.includes('✅') ? '#4CAF50' : faucetMessage.includes('⚠️') || faucetMessage.includes('💡') || faucetMessage.includes('❌') ? '#FFD700' : '#f44336', 
                marginTop: '8px',
                wordBreak: 'break-word'
              }}>
                {faucetMessage.includes('https://') ? (
                  <>
                    {faucetMessage.split('https://')[0]}
                    <a 
                      href={`https://${faucetMessage.split('https://')[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FFD700', textDecoration: 'underline' }}
                    >
                      https://{faucetMessage.split('https://')[1]}
                    </a>
                  </>
                ) : (
                  faucetMessage
                )}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              {faucetMessage.includes('manual') || faucetMessage.includes('❌') ? (
                <>
                  Or visit{' '}
                  <a 
                    href="https://clearnet-sandbox.yellow.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#4A90E2', textDecoration: 'underline' }}
                  >
                    Yellow Network Sandbox
                  </a>
                  {' '}directly
                </>
              ) : (
                'Requests ytest.USD tokens to your wallet address'
              )}
            </div>
          </div>
          
          <div className="input-group">
            <label>Initial Deposit (USDC)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="10"
              step="10"
              className="input input-large"
              disabled={loading}
            />
          </div>
          
          {loading && creatingStep > 0 && (
            <div className="creation-steps">
              <div className={`step ${creatingStep >= 1 ? 'active' : ''}`}>
                <span className="step-text">Locking funds on-chain...</span>
              </div>
              <div className={`step ${creatingStep >= 2 ? 'active' : ''}`}>
                <span className="step-text">Opening Yellow state channel...</span>
              </div>
              <div className={`step ${creatingStep >= 3 ? 'active' : ''}`}>
                <span className="step-text">Initializing off-chain state...</span>
              </div>
            </div>
          )}
          
          <button
            onClick={createSession}
            disabled={loading || !depositAmount || parseFloat(depositAmount) < 10 || parseFloat(formattedBalance) < parseFloat(depositAmount)}
            className="btn btn-primary btn-large"
            title={parseFloat(formattedBalance) < parseFloat(depositAmount) ? 'Insufficient ytest.USD balance' : ''}
          >
            {loading ? 'Creating Session...' : parseFloat(formattedBalance) < parseFloat(depositAmount) ? 'Insufficient Balance' : 'Start Trading Session'}
          </button>
          
          <div className="session-benefits">
            <div className="benefit-item">
              <span className="benefit-text">Instant trades (&lt;100ms)</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-text">Zero gas fees</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-text">25% refundable</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="session-active">
          <div className="session-status">
            <div className="status-badge active">
              <span className="pulse-dot"></span>
              <span>ACTIVE SESSION</span>
            </div>
          </div>
          
          <div className="session-details">
            <div className="detail-card">
              <div className="detail-header">Channel Balance</div>
              <div className="detail-value balance-value">
                {(parseFloat(session.depositAmount) - parseFloat(session.spentAmount || '0')).toFixed(2)} <span className="currency">USDC</span>
              </div>
              <div className="detail-meta">Off-chain</div>
            </div>
            
            <div className="detail-card">
              <div className="detail-header">Session ID</div>
              <div className="detail-value small">
                {session.sessionId.slice(0, 12)}...
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-header">Channel ID</div>
              <div className="detail-value small">
                {session.channelId.slice(0, 12)}...
              </div>
            </div>
          </div>
          
          <div className="session-actions">
            <div className="action-section">
              <h4>Deposit Funds</h4>
              <div className="action-input-group">
                <input
                  type="number"
                  value={additionalDeposit}
                  onChange={(e) => setAdditionalDeposit(e.target.value)}
                  min="10"
                  step="10"
                  className="input"
                  placeholder="Amount"
                />
                <button
                  onClick={handleDeposit}
                  disabled={loading}
                  className="btn btn-success"
                >
                  Deposit
                </button>
              </div>
              <p className="action-note">
                <strong>Withdraw via API:</strong> POST /api/balance/withdraw
                <br/>
                Example: <code>curl -X POST http://localhost:3000/api/balance/withdraw -H &quot;Content-Type: application/json&quot; -d &apos;&#123;&quot;sessionId&quot;:&quot;YOUR_SESSION_ID&quot;,&quot;amount&quot;:100&#125;&apos;</code>
              </p>
            </div>
          </div>
          
          <button
            onClick={closeSession}
            disabled={loading}
            className="btn btn-danger btn-block"
          >
            {loading ? 'Closing...' : 'Close & Settle On-Chain'}
          </button>
          
          <div className="session-info-text">
            <p>All trades happen OFF-CHAIN in Yellow Network</p>
            <p>Final settlement ON-CHAIN when you close</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          {error.includes('Session expired') && (
            <button
              onClick={createSession}
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '10px', width: '100%' }}
            >
              {loading ? 'Reconnecting...' : '🔄 Reconnect Session'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;
