import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import SessionManager from './components/SessionManager';
import MarketDashboard from './components/MarketDashboard';
import BalanceDisplayNew from './components/BalanceDisplayNew';
import PositionsView from './components/PositionsView';

const App = () => {
  const [currentView, setCurrentView] = useState<'markets' | 'positions' | 'about'>('markets');

  return (
    <div className="app">
      <style>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-bottom: 3px solid #667eea;
        }

        .header h1 {
          margin: 0;
          font-size: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          margin: 5px 0 0 0;
          color: #6c757d;
          font-size: 14px;
        }

        .tech-stack {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #495057;
        }

        .tech-badge.yellow {
          border-color: #ffc107;
          color: #856404;
        }

        .tech-badge.sui {
          border-color: #4da3ff;
          color: #004085;
        }

        .container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          padding: 20px;
          max-width: 1800px;
          margin: 0 auto;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .nav {
          display: flex;
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          padding: 0;
        }

        .nav-btn {
          flex: 1;
          padding: 18px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #6c757d;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
        }

        .nav-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .nav-btn.active {
          background: white;
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .content {
          padding: 30px;
        }

        .about-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .about-section h2 {
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }

        .feature-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .feature-box h3 {
          margin: 0 0 10px 0;
          font-size: 20px;
        }

        .feature-box p {
          margin: 0;
          opacity: 0.95;
          font-size: 14px;
          line-height: 1.6;
        }

        .architecture-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
        }

        .architecture-section h3 {
          margin-top: 0;
          color: #495057;
        }

        .architecture-layer {
          background: white;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 8px;
        }

        .architecture-layer h4 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
        }

        .architecture-layer p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .workflow-steps {
          counter-reset: step;
          list-style: none;
          padding: 0;
        }

        .workflow-steps li {
          counter-increment: step;
          padding: 15px;
          padding-left: 60px;
          position: relative;
          margin-bottom: 15px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .workflow-steps li::before {
          content: counter(step);
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            grid-row: 2;
          }
        }
      `}</style>

      <header className="header">
        <h1>🏛️ VaultOS</h1>
        <p className="subtitle">Instant Prediction Markets with Zero Gas Fees</p>
        <div className="tech-stack">
          <span className="tech-badge yellow">⚡ Yellow Network</span>
          <span className="tech-badge sui">🔷 Sui Settlement</span>
          <span className="tech-badge">🔒 Session Security</span>
          <span className="tech-badge">💱 AMM Trading</span>
        </div>
      </header>

      <div className="container">
        <div className="sidebar">
          <WalletConnect />
          <SessionManager />
          <BalanceDisplayNew />
        </div>

        <div className="main-content">
          <nav className="nav">
            <button 
              className={`nav-btn ${currentView === 'markets' ? 'active' : ''}`}
              onClick={() => setCurrentView('markets')}
            >
              📊 Markets
            </button>
            <button 
              className={`nav-btn ${currentView === 'positions' ? 'active' : ''}`}
              onClick={() => setCurrentView('positions')}
            >
              📈 Positions
            </button>
            <button 
              className={`nav-btn ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentView('about')}
            >
              ℹ️ About
            </button>
          </nav>

          <div className="content">
            {currentView === 'markets' && <MarketDashboard />}
            {currentView === 'positions' && <PositionsView />}
            {currentView === 'about' && (
              <div className="about-section">
                <h2>Welcome to VaultOS</h2>
                <p>
                  VaultOS is a next-generation prediction market platform that combines the speed of
                  off-chain trading with the security of blockchain settlement.
                </p>

                <div className="feature-grid">
                  <div className="feature-box">
                    <h3>⚡ Instant Trading</h3>
                    <p>Trade with sub-second execution and zero gas fees using Yellow Network state channels</p>
                  </div>
                  <div className="feature-box">
                    <h3>🔒 Session Security</h3>
                    <p>Session keys protect your main wallet while allowing seamless trading</p>
                  </div>
                  <div className="feature-box">
                    <h3>🔷 Sui Settlement</h3>
                    <p>Final market outcomes recorded on Sui blockchain for transparency</p>
                  </div>
                  <div className="feature-box">
                    <h3>💱 Fair Pricing</h3>
                    <p>Automated Market Maker ensures fair pricing based on supply and demand</p>
                  </div>
                </div>

                <div className="architecture-section">
                  <h3>🏗️ Architecture</h3>
                  <div className="architecture-layer">
                    <h4>Trading Layer: Yellow Network</h4>
                    <p>
                      All trades execute instantly off-chain using Yellow Network state channels.
                      No gas fees, no waiting, no blockchain congestion.
                    </p>
                  </div>
                  <div className="architecture-layer">
                    <h4>Settlement Layer: Sui Blockchain</h4>
                    <p>
                      When markets resolve, final outcomes are committed to Sui as immutable objects.
                      This provides transparent verification and trustless settlement.
                    </p>
                  </div>
                  <div className="architecture-layer">
                    <h4>Security: Session-Based</h4>
                    <p>
                      Your main wallet stays safe offline. Session keys with limited allowances
                      enable trading without exposing your primary private key.
                    </p>
                  </div>
                </div>

                <h3>🚀 How It Works</h3>
                <ol className="workflow-steps">
                  <li>
                    <strong>Connect Your Wallet</strong><br />
                    Connect your Ethereum-compatible wallet (MetaMask, etc.)
                  </li>
                  <li>
                    <strong>Create a Session</strong><br />
                    Generate a session key and deposit USDC for trading
                  </li>
                  <li>
                    <strong>Browse Markets</strong><br />
                    Explore prediction markets on various topics
                  </li>
                  <li>
                    <strong>Trade Instantly</strong><br />
                    Buy YES or NO shares with instant execution
                  </li>
                  <li>
                    <strong>Track Positions</strong><br />
                    Monitor your positions in real-time
                  </li>
                  <li>
                    <strong>Claim Winnings</strong><br />
                    When markets resolve, claim your winnings automatically
                  </li>
                </ol>

                <div style={{ 
                  background: '#e7f3ff', 
                  border: '2px solid #4da3ff', 
                  borderRadius: '12px', 
                  padding: '20px',
                  marginTop: '30px'
                }}>
                  <h4 style={{ marginTop: 0, color: '#004085' }}>🎓 Built for ETHGlobal</h4>
                  <p style={{ marginBottom: 0, color: '#004085' }}>
                    This platform demonstrates the power of hybrid blockchain architecture:
                    Yellow Network for speed, Sui for transparency. The best of both worlds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
