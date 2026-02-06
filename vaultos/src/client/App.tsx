import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import SessionManager from './components/SessionManager';
import MarketListNew from './components/MarketListNew';
import TradePanelNew from './components/TradePanelNew';
import BalanceDisplayNew from './components/BalanceDisplayNew';

const App = () => {
  const [currentView, setCurrentView] = useState<'home' | 'markets' | 'trade'>('home');

  return (
    <div className="app">
      <header className="header">
        <h1>VaultOS Prediction Markets</h1>
        <p className="subtitle">Powered by Yellow Network</p>
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
              className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button 
              className={`nav-btn ${currentView === 'markets' ? 'active' : ''}`}
              onClick={() => setCurrentView('markets')}
            >
              Markets
            </button>
            <button 
              className={`nav-btn ${currentView === 'trade' ? 'active' : ''}`}
              onClick={() => setCurrentView('trade')}
            >
              Trade
            </button>
          </nav>

          <div className="content">
            {currentView === 'home' && (
              <div className="home">
                <h2>Welcome to VaultOS</h2>
                <div className="features">
                  <div className="feature-card">
                    <h3>Instant Trading</h3>
                    <p>Trade with low latency and zero gas fees</p>
                  </div>
                  <div className="feature-card">
                    <h3>Secure Sessions</h3>
                    <p>Session keys protect your main wallet</p>
                  </div>
                  <div className="feature-card">
                    <h3>Off-Chain Trading</h3>
                    <p>All trades happen on Yellow Network</p>
                  </div>
                  <div className="feature-card">
                    <h3>Easy Settlement</h3>
                    <p>Close session to settle on-chain</p>
                  </div>
                </div>
                
                <div className="instructions">
                  <h3>How it works:</h3>
                  <ol>
                    <li>Connect your wallet</li>
                    <li>Create a Yellow Network session</li>
                    <li>Create or browse prediction markets</li>
                    <li>Trade YES/NO shares instantly</li>
                    <li>Close session to settle</li>
                  </ol>
                </div>
              </div>
            )}
            {currentView === 'markets' && <MarketListNew />}
            {currentView === 'trade' && <TradePanelNew />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
