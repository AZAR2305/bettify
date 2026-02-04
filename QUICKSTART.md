# 🚀 Quick Start Guide - VaultOS Wallet Integration

## Installation & Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd vaultos
npm install
```

This will install:
- React 18 & TypeScript
- Wagmi (Web3 wallet integration)
- Viem (Ethereum interactions)
- Express server
- Yellow Network integration

### Step 2: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 VaultOS server running on http://localhost:3000
📡 Yellow Network integration active
💼 Wallet-based sessions enabled
```

### Step 3: Start Frontend (New Terminal)

```bash
npm run dev:client
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open Browser

Navigate to: **http://localhost:5173**

---

## 👛 Using the Application

### Connect Your Wallet

1. Click "**Connect with Injected**" or "**Connect with MetaMask**"
2. Approve the connection in your wallet
3. You'll see your wallet address displayed

### Create a Trading Session

1. In the sidebar, see "**🎮 Trading Session**"
2. Enter deposit amount (e.g., `1000` USDC)
3. Click "**🚀 Create Session**"
4. Session created with:
   - Isolated session wallet
   - State channel with Yellow Network
   - 1 hour expiration
   - Up to 25% refundable

### Create a Prediction Market

1. Click "**📊 Markets**" tab
2. Click "**➕ Create Market**"
3. Fill in:
   - Question: "Will BTC reach $150k by June 2026?"
   - Description: "Market resolves YES if..."
   - Duration: 30 minutes
   - YES Price: 0.55 (55¢)
4. Click "**🚀 Create Market**"

### Trade on Markets

1. Click "**💱 Trade**" tab
2. Select a market from dropdown
3. Choose trade type:
   - **Buy YES**: Buy YES shares
   - **Buy NO**: Buy NO shares
   - **Sell YES**: Sell YES shares (if you own them)
   - **Sell NO**: Sell NO shares (if you own them)
4. Enter number of shares (e.g., `100`)
5. Review total cost
6. Click "**⚡ Execute Trade**"
7. Trade executes instantly (<100ms)

### View Your Balance

In the sidebar, see "**💰 Balance**":
- **Active**: Available for trading
- **Idle**: Earning 5% APR
- **Yield**: Accumulated earnings
- **Total**: Total balance

Actions:
- **📊 Move to Idle**: Move funds to earn yield
- **💸 Request Refund**: Get up to 25% back
- **🔄 Refresh**: Update balance

### Close Session

1. Click "**Close Session & Settle**"
2. State channel closes
3. Final balance calculated
4. Funds returned (simulated)

---

## 🎯 Demo Scenario

### Complete Trading Flow (5 minutes)

```bash
# 1. Connect wallet → Done in UI

# 2. Create session with 1000 USDC → Done in UI

# 3. Create a market → Done in UI
Question: "Will ETH reach $5000 by March 2026?"
Duration: 30 min
YES Price: 0.65

# 4. Buy 100 YES shares → Done in UI
Cost: 100 × $0.65 = $65 USDC
Remaining: 1000 - 65 = $935 USDC

# 5. Move $200 to idle → Click "Move to Idle"
Active: $735, Idle: $200

# 6. Buy 50 NO shares → Done in UI
Cost: 50 × $0.35 = $17.50
Active: $717.50, Idle: $200

# 7. View your positions → Check sidebar
100 YES + 50 NO on "ETH $5000" market

# 8. Request refund → Click "Request Refund"
Refund: up to $250 (25% of deposit)

# 9. Close session → Click "Close Session"
Final settlement
```

---

## 🔧 Architecture Overview

### Frontend (React + Wagmi)
```
vaultos/src/client/
├── AppNew.tsx              # Main app with navigation
├── wagmi.config.ts         # Wallet connection config
├── main.tsx                # App entry with providers
├── components/
│   ├── WalletConnect.tsx   # Wallet connection UI
│   ├── SessionManager.tsx  # Session creation/management
│   ├── MarketListNew.tsx   # Market creation & display
│   ├── TradePanelNew.tsx   # Trading interface
│   └── BalanceDisplayNew.tsx # Balance & positions
└── index.css               # Complete styling
```

### Backend (Express + Yellow Network)
```
vaultos/src/server/
├── index.ts                # Express server with CORS
├── routes/
│   ├── session.ts          # Session management
│   ├── market.ts           # Market creation
│   ├── trade.ts            # Trade execution
│   ├── balance.ts          # Balance operations
│   └── state.ts            # State queries
└── services/
    └── SessionService.ts   # Yellow Network integration
```

### Yellow Network Integration
```
src/yellow/
├── client.ts               # Yellow Network client
├── session.ts              # Session & state channel management
└── state.ts                # Off-chain state management
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173

# Restart servers
npm run dev
npm run dev:client
```

### Wallet Not Connecting
- Install MetaMask extension
- Refresh browser page
- Check browser console for errors
- Try different wallet connector

### Session Not Creating
- Check backend server is running (port 3000)
- Open browser console for error messages
- Verify wallet is connected
- Check network requests in DevTools

### Types Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Testing Checklist

- [ ] Wallet connects successfully
- [ ] Session creates with deposit
- [ ] Market creates with custom parameters
- [ ] Buy YES shares executes instantly
- [ ] Buy NO shares executes instantly
- [ ] Balance updates after trade
- [ ] Move to idle works
- [ ] Positions display correctly
- [ ] Request refund works
- [ ] Close session settles

---

## 🎉 Success!

You now have a fully functional wallet-based prediction market with:
- ✅ MetaMask integration
- ✅ Yellow Network state channels
- ✅ Session-based trading
- ✅ Instant trade execution
- ✅ Yield optimization
- ✅ Partial refunds
- ✅ Beautiful UI

**Next Steps:**
- Create multiple markets
- Test different trading scenarios
- Move funds between active/idle
- Request partial refunds
- Close and create new sessions

---

## 📚 Additional Resources

- [README_WALLET.md](README_WALLET.md) - Complete documentation
- [DEMO.md](DEMO.md) - Original API demo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep dive

**Happy Trading! 🚀**
