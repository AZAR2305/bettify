# VaultOS - Wallet-Based Prediction Market

A decentralized prediction market platform with Yellow Network state channels integration, featuring wallet-based authentication and instant off-chain trading.

## 🚀 Features

- **🔐 Wallet Connection**: Connect with MetaMask or any Web3 wallet
- **🎮 Session Management**: Create isolated trading sessions with limited permissions
- **⚡ Instant Trading**: Trade YES/NO shares with <100ms latency, zero gas fees
- **📊 Create Markets**: Anyone can create prediction markets
- **💰 Yield Optimization**: Earn 5% APR on idle funds
- **💸 Partial Refunds**: Request up to 25% refund anytime
- **🔒 Security**: Session keys protect your main wallet

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask or any Web3 wallet browser extension
- npm or yarn

## 🛠️ Installation

```bash
# Install dependencies
npm install
```

## 🏃 Running the Application

### Start the Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Start the Frontend (in a new terminal)

```bash
npm run dev:client
```

Frontend will run on `http://localhost:5173`

## 📖 Usage Guide

### 1. Connect Your Wallet

- Open `http://localhost:5173` in your browser
- Click "Connect with MetaMask" (or your preferred wallet)
- Approve the connection request

### 2. Create a Trading Session

- Enter deposit amount (e.g., 1000 USDC)
- Click "🚀 Create Session"
- Session wallet is created with Yellow Network
- State channel opens for instant trading

### 3. Create or Browse Markets

- Navigate to "📊 Markets" tab
- Click "➕ Create Market" to create a new prediction market
- Fill in question, description, duration, and initial YES price
- Or browse existing markets

### 4. Trade

- Navigate to "💱 Trade" tab
- Select a market
- Choose trade type (Buy YES, Buy NO, Sell YES, Sell NO)
- Enter number of shares
- Click "⚡ Execute Trade" for instant execution

### 5. Manage Balance

- View your balance in the sidebar
- **Move to Idle**: Click "📊 Move to Idle" to earn 5% APR
- **Request Refund**: Click "💸 Request Refund" for up to 25% back
- **Refresh**: Click "🔄 Refresh" to update balance

### 6. Close Session

- Click "Close Session & Settle"
- Final balance calculated
- State channel closed
- Funds returned to your wallet

## 🏗️ Architecture

### Frontend (`vaultos/src/client/`)
- **App.tsx**: Main application component
- **WalletConnect.tsx**: Wallet connection using wagmi
- **SessionManager.tsx**: Trading session management
- **MarketListNew.tsx**: Market creation and display
- **TradePanelNew.tsx**: Trade execution interface
- **BalanceDisplayNew.tsx**: Balance and position tracking

### Backend (`vaultos/src/server/`)
- **index.ts**: Express server with CORS
- **routes/**: API endpoints for session, market, trade, balance
- **services/**: Business logic for Yellow Network integration

### Yellow Network Integration (`src/yellow/`)
- **client.ts**: Yellow Network client
- **session.ts**: Session management with state channels
- **state.ts**: Off-chain state management

## 🔧 API Endpoints

### Session Management
- `POST /api/session/create` - Create trading session
- `POST /api/session/close` - Close session and settle
- `GET /api/session/:sessionId` - Get session info

### Markets
- `GET /api/markets` - List all markets
- `POST /api/market/create` - Create new market

### Trading
- `POST /api/trade/buy-yes` - Buy YES shares
- `POST /api/trade/buy-no` - Buy NO shares
- `POST /api/trade/sell-yes` - Sell YES shares
- `POST /api/trade/sell-no` - Sell NO shares

### Balance
- `GET /api/state/:sessionId` - Get balance and positions
- `POST /api/balance/move-to-idle` - Move funds to yield
- `POST /api/balance/accrue-yield` - Accrue yield
- `POST /api/balance/refund` - Request partial refund

## 🎨 Technology Stack

- **Frontend**: React 18, TypeScript, Wagmi, Viem
- **Backend**: Express.js, Node.js
- **Blockchain**: Ethers.js, Yellow Network State Channels
- **Wallet**: MetaMask integration via Wagmi
- **Build**: Vite, TypeScript

## 🔐 Security Features

- **Session Keys**: Temporary keys isolate main wallet
- **Spending Limits**: Max allowance enforced
- **Auto-Expiration**: Sessions expire after 1 hour
- **Limited Refunds**: Max 25% to prevent abuse
- **Off-chain Security**: Cryptographic signatures on every trade

## 📊 Yellow Network Integration

VaultOS uses Yellow Network state channels for:
- **Instant Settlement**: <100ms trade execution
- **Zero Gas Fees**: All trades off-chain during session
- **High Throughput**: 10,000+ TPS
- **Cryptographic Proof**: Every state update signed
- **Final Settlement**: On-chain settlement when closing session

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Wallet connection
- ✅ Session management
- ✅ Market creation
- ✅ Instant trading
- ✅ Balance management
- ✅ Partial refunds

### Phase 2 (Future)
- 🔲 Sui blockchain integration
- 🔲 Real oracle resolution
- 🔲 Real DeFi yield (3-8% APR)
- 🔲 Advanced order types
- 🔲 Social trading features
- 🔲 Mobile app

## 🐛 Troubleshooting

### Server not starting?
```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### Wallet not connecting?
- Make sure MetaMask is installed
- Check if you're on the correct network (Sepolia testnet)
- Try refreshing the page

### Session expired?
Sessions last 1 hour. Create a new one:
- Click "Close Session & Settle"
- Create a new session with "🚀 Create Session"

## 📄 License

MIT

## 👥 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**🎉 Happy Trading! Build the future of prediction markets! 🚀**
