# VaultOS Deployment Guide

## 🚨 Critical Issues to Fix Before Deployment

### 1. **Hardcoded URLs** ❌
**Current Issue:**
```typescript
// ❌ WRONG - Hardcoded in ALL components
const response = await fetch('http://localhost:3000/api/markets');
const ws = new WebSocket('ws://localhost:3000/community');
```

**Fix Required:**
```typescript
// ✅ CORRECT - Use environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

const response = await fetch(`${API_URL}/api/markets`);
const ws = new WebSocket(`${WS_URL}/community`);
```

**Files to Update:**
- `MarketList.tsx`
- `TradePanel.tsx`
- `PositionsView.tsx`
- `TradeHistory.tsx`
- `BalanceDisplay.tsx`
- `LedgerBalanceCard.tsx`
- `CommunityChat.tsx`

**Create `.env` file:**
```bash
# Development
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Production
VITE_API_URL=https://api.vaultos.io
VITE_WS_URL=wss://api.vaultos.io
```

---

### 2. **WebSocket Production Issues** ⚠️

**Problem 1: HTTP vs HTTPS**
- Local: `ws://localhost:3000` ✅
- Production HTTPS site: `ws://` ❌ (browsers block non-secure WebSocket)
- Must use: `wss://` (WebSocket Secure)

**Problem 2: Connection Limits**
- Each user creates 1 WebSocket connection per page
- Dashboard view has 3 CommunityChat instances = 3 connections!
- Need connection pooling or single shared WebSocket

**Fix:**
```typescript
// Create singleton WebSocket manager
class CommunityWebSocket {
  private static instance: CommunityWebSocket;
  private ws: WebSocket | null = null;
  private listeners = new Set<(data: any) => void>();

  static getInstance() {
    if (!this.instance) {
      this.instance = new CommunityWebSocket();
    }
    return this.instance;
  }

  connect(address: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    // Single connection shared across all components
  }
}
```

---

### 3. **CORS Configuration** 🔒

**Current Issue:**
```typescript
// ❌ Allows ALL origins in production
app.use(cors());
```

**Fix for Production:**
```typescript
// ✅ Whitelist specific domains
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vaultos.io', 'https://www.vaultos.io']
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 4. **Missing Backend APIs** ❌

**Components expecting endpoints that DON'T EXIST:**

```typescript
// ✅ EXISTS
GET  /api/markets              // Working
GET  /api/positions/:address   // Working
POST /api/positions/refund     // Working

// ❌ MISSING - Will cause 404 errors
GET  /api/trades/:address      // TradeHistory.tsx expects this
GET  /api/balance/:address     // BalanceDisplay.tsx expects this
GET  /api/yellow/balance/:address // LedgerBalanceCard.tsx expects this
```

**You MUST create these routes or components will fail!**

---

### 5. **Database/Persistence** 💾

**Current Issue:**
- All data in memory (MarketService singleton)
- Server restart = **ALL DATA LOST**
- User positions, trades, balances - GONE

**Required for Production:**
- PostgreSQL, MongoDB, or similar database
- Redis for caching and session management
- Data backup strategy

**Migration Priority:**
```
1. Market data (questions, odds, volumes)
2. User positions and trades
3. Transaction history
4. Community chat history (optional)
```

---

### 6. **Yellow Network Configuration** 🟡

**Current Sandbox Settings:**
```typescript
// ❌ Testnet only
wss://clearnet-sandbox.yellow.com/ws
ytest.usd (fake tokens)
```

**Production Requirements:**
- Switch to mainnet: `wss://clearnet.yellow.com/ws`
- Real USDC tokens (NOT ytest.usd)
- Liquidity deposit required
- Trading fees to Yellow Network
- Compliance/KYC requirements

---

### 7. **Security Vulnerabilities** 🔐

**Critical Issues:**

1. **No Authentication**
   - Any wallet can call any API endpoint
   - No signature verification
   - Users can fake other addresses

2. **No Rate Limiting**
   - Spam attacks possible
   - DoS vulnerability
   - Infinite refund requests

3. **No Input Validation**
   - SQL injection risk (when you add DB)
   - XSS attacks via chat messages
   - Invalid trade amounts

**Required Middleware:**
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per minute
});
app.use('/api/', limiter);

// Input sanitization
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
app.use(helmet());

// Wallet signature verification
function verifyWalletSignature(req, res, next) {
  const { address, signature, message } = req.body;
  const recovered = ethers.utils.verifyMessage(message, signature);
  if (recovered !== address) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
}
```

---

### 8. **Smart Contract Issues** 📜

**Current Setup:**
- YellowPredictionRegistry at `0x615807920BEA0751AbE4682f18b55C0e1BaA0112`
- **Testnet only** (Base Sepolia)

**Production Needs:**
- Deploy to mainnet (Base, Ethereum, Arbitrum, etc.)
- Audit smart contracts (security critical!)
- Verify contracts on Etherscan
- Multi-sig admin wallet
- Emergency pause function
- Upgrade mechanism (proxy pattern)

---

### 9. **Frontend Bundle Size** 📦

**Current Issues:**
- Wagmi + ethers = large bundle
- No code splitting
- No lazy loading

**Optimization:**
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./components/Dashboard'));
const Trade = lazy(() => import('./components/Trade'));

// Suspense wrapper
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

### 10. **Error Handling** 🐛

**Current Issues:**
- No error boundaries
- Blank pages on crash
- No user feedback

**Required:**
```typescript
// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// Wrap app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 📋 Deployment Checklist

### Pre-Deployment (Required)
- [ ] Replace all `localhost:3000` with environment variables
- [ ] Replace `ws://` with `wss://` for production
- [ ] Create missing backend APIs (`/api/trades`, `/api/balance`, `/api/yellow/balance`)
- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Configure production CORS
- [ ] Add authentication/signature verification
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Deploy smart contracts to mainnet
- [ ] Get smart contract audit
- [ ] Switch Yellow Network to mainnet
- [ ] Add error boundaries
- [ ] Fix WebSocket connection pooling
- [ ] Add SSL certificates

### Hosting Options

**Backend:**
- Railway.app
- Render.com
- DigitalOcean
- AWS EC2
- Heroku

**Frontend:**
- Vercel (recommended)
- Netlify
- Cloudflare Pages

**Database:**
- Supabase (PostgreSQL)
- MongoDB Atlas
- PlanetScale (MySQL)

### Environment Variables Needed

**Backend (.env):**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
YELLOW_API_KEY=...
YELLOW_BROKER_ID=...
ADMIN_ADDRESS=0x...
JWT_SECRET=...
CORS_ORIGIN=https://vaultos.io
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.vaultos.io
VITE_WS_URL=wss://api.vaultos.io
VITE_CHAIN_ID=8453
VITE_REGISTRY_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=...
```

---

## 🚀 Quick Fix Priority

**Your app will BREAK in production without these:**

1. **CRITICAL** - Replace hardcoded URLs (1 hour)
2. **CRITICAL** - Add missing backend APIs (2 hours)
3. **CRITICAL** - Fix WebSocket wss:// (30 mins)
4. **HIGH** - Add database (3 hours)
5. **HIGH** - Fix CORS (15 mins)
6. **HIGH** - Add error boundaries (1 hour)
7. **MEDIUM** - Add authentication (4 hours)
8. **MEDIUM** - Deploy mainnet contracts (varies)

**Total time to production-ready: ~2-3 days minimum**

---

## 💰 Estimated Costs

**Monthly Operating Costs:**
- Backend hosting: $10-50
- Database: $10-25
- Frontend hosting: $0 (free tier)
- Yellow Network liquidity: Variable (your deposit)
- Smart contract deployment: $100-500 (one-time)
- Smart contract audit: $5,000-$50,000 (one-time)

---

## ⚠️ Legal/Compliance

**You MUST consider:**
- Securities laws (prediction markets may be regulated)
- KYC/AML requirements
- Geographic restrictions
- Terms of Service
- Privacy Policy
- Gambling licenses (depends on jurisdiction)

**Consult with legal counsel before launching!**

---

## 📞 Support

If you deploy without fixing these issues:
- ❌ WebSocket will fail (ws:// doesn't work on HTTPS)
- ❌ APIs will 404 (missing routes)
- ❌ Data will be lost (no database)
- ❌ Users can be attacked (no security)
- ❌ App will crash (no error handling)

**Start with the Quick Fix Priority list above!**
