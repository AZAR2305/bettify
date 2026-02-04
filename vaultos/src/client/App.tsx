import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import SessionManager from './components/SessionManager';
import MarketList from './components/MarketList';
import TradePanel from './components/TradePanel';
import BalanceDisplay from './components/BalanceDisplay';

const App = () => {
  return (
    <Router>
      <div>
        <h1>VaultOS Prediction Market</h1>
        <WalletConnect />
        <SessionManager />
        <BalanceDisplay />
        <Switch>
          <Route path="/markets" component={MarketList} />
          <Route path="/trade" component={TradePanel} />
          <Route path="/" exact>
            <h2>Welcome to the VaultOS Prediction Market!</h2>
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;