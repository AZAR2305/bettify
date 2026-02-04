# VaultOS - Technical Architecture

## System Overview

VaultOS implements a two-phase architecture for real-time prediction markets:

**Phase 1** (Current): Off-chain trading via Yellow Network state channels  
**Phase 2** (Next): On-chain settlement via Sui blockchain

---

## Phase 1: Yellow Network Integration

### State Channel Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│ 1. INITIALIZATION                                             │
│    User deposits USDC → Yellow smart contract                │
│    Session key created with limited permissions              │
│    State channel opened                                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. TRADING (Off-chain)                                        │
│    All trades happen via signed state updates                │
│    No blockchain interaction                                 │
│    < 100ms latency per trade                                 │
│    Zero gas fees                                             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. SETTLEMENT (Phase 2: Sui)                                 │
│    Close channel with final signed state                     │
│    Submit to Sui contract                                    │
│    Parallel processing with other channels                   │
│    Funds returned to main wallet                             │
└──────────────────────────────────────────────────────────────┘
```

### Security Architecture

#### Why Session Keys?

**Problem**: Every trade requires wallet signature → Private key exposed repeatedly

**Solution**: Session key with bounded permissions
- Maximum spending limit
- Time-based expiration
- Single-purpose usage
- Revocable at any time

**Security guarantees**:
```typescript
SessionKey {
  maxAllowance: 1000 USDC,    // Cannot exceed
  duration: 3600 seconds,      // Auto-expires
  maxRefund: 25%,              // Limited exit
  permissions: ['trade'],      // Scoped actions
  revocable: true              // User can cancel
}
```

#### State Signing Protocol

Every state update follows this protocol:

1. **Create state hash**:
   ```
   hash = keccak256(channelId || nonce || newBalance)
   ```

2. **Sign with session key**:
   ```
   signature = sessionKey.sign(hash)
   ```

3. **Send to Yellow node**:
   ```json
   {
     "channelId": "0x...",
     "nonce": 42,
     "balance": 950000000,
     "signature": "0x..."
   }
   ```

4. **Node validates**:
   - Signature is valid
   - Nonce is sequential
   - Balance change is authorized

5. **User stores proof**:
   - Signed state kept locally
   - Can prove correct state on-chain
   - Protection against malicious node

#### Dispute Resolution

**Scenario**: Yellow node submits incorrect final state

**User defense**:
1. User has signed state N with balance X
2. Node claims state N-5 with balance Y (lower)
3. User submits state N to L1 contract
4. Contract verifies:
   - Signature is valid (from session key)
   - Nonce N > N-5 (newer state)
   - Balance X is cryptographically proven
5. Contract enforces correct state
6. User receives correct payout

**Key insight**: User always wins with valid signatures

---

## Off-chain State Model

### State Structure

```typescript
UserState {
  // Identity
  channelId: string
  userAddress: string
  sessionKey: string
  
  // Balances
  depositedAmount: bigint      // Initial deposit
  activeBalance: bigint        // Available for trading
  idleBalance: bigint          // Earning yield
  accruedYield: bigint         // Accumulated rewards
  
  // Positions (per market)
  positions: Map<marketId, {
    yesShares: number
    noShares: number
    invested: bigint
  }>
  
  // Refund tracking
  refundableAmount: bigint     // Max 25%
  refundClaimed: boolean
  
  // Versioning
  nonce: number                // Monotonic counter
  version: string
  signatures: string[]         // Audit trail
}
```

### State Transitions

All state changes follow atomic updates:

```typescript
// Example: Buy YES shares
function buyYes(amount: bigint, shares: number) {
  // 1. Validate
  assert(activeBalance >= amount)
  assert(session.canSpend(amount))
  
  // 2. Update state
  activeBalance -= amount
  positions[marketId].yesShares += shares
  positions[marketId].invested += amount
  
  // 3. Increment nonce
  nonce++
  
  // 4. Sign new state
  signature = sign(channelId || nonce || activeBalance)
  signatures.push(signature)
  
  // 5. Broadcast to Yellow
  sendStateUpdate(signature)
}
```

---

## Prediction Market Model

### Binary Market Structure

```typescript
Market {
  marketId: string
  question: string
  description: string
  
  // Pricing (Phase 1: Fixed odds)
  yesPrice: number    // 0-1 scale (e.g., 0.65 = 65%)
  noPrice: number     // 1 - yesPrice
  
  // Constraint: yesPrice + noPrice = 1.0
  
  // Timing
  createdAt: timestamp
  endTime: timestamp
  resolvedAt?: timestamp
  
  // Status
  status: ACTIVE | CLOSED | RESOLVED
  outcome: YES | NO | UNRESOLVED
  
  // Volume
  totalVolume: bigint
  totalYesShares: bigint
  totalNoShares: bigint
}
```

### Pricing Model (Phase 1)

**Fixed Odds Pricing**:
- Simple and predictable
- No slippage
- No liquidity concerns
- Perfect for MVP

**Trade calculation**:
```typescript
// Buying
cost = shares × price
Example: 100 YES at 0.65 = 65 USDC

// Selling
payout = shares × price
Example: 100 YES at 0.65 = 65 USDC
```

**Constraints**:
- YES price ∈ (0, 1)
- NO price = 1 - YES price
- Total probability = 100%

### Future Pricing Models (Phase 2)

**Constant Product AMM**:
```
x × y = k

Where:
x = YES liquidity
y = NO liquidity
k = constant product
```

**Benefits**:
- Dynamic pricing
- Market-driven odds
- Slippage based on size
- Incentivized liquidity

---

## Yield Mechanism

### Phase 1: Simulated Yield

```typescript
// Time-based accrual
const APR = 0.05  // 5% annual
const timeDelta = now - lastUpdate  // seconds
const yieldFactor = APR × (timeDelta / secondsPerYear)
const yieldAmount = idleBalance × yieldFactor

accruedYield += yieldAmount
```

**Properties**:
- Continuous compounding
- Proportional to idle balance
- No smart contract integration
- Demonstrates concept

### Phase 2: Real Yield on Sui

**DeFi Integration**:

1. **Scallop Protocol** (Lending)
   ```move
   public entry fun deposit_for_yield(
     pool: &mut LendingPool,
     amount: Coin<USDC>
   ) {
     // Deposit USDC
     // Receive sUSDC (yield-bearing)
     // Auto-compounds
   }
   ```

2. **NAVI Protocol** (Money Market)
   ```move
   public entry fun supply(
     pool: &mut Pool,
     coin: Coin<USDC>
   ): Coin<nUSDC> {
     // Supply to money market
     // Earn lending APY
   }
   ```

3. **Cetus DEX** (Liquidity Provision)
   ```move
   public entry fun add_liquidity(
     pool: &mut Pool,
     usdc: Coin<USDC>,
     sui: Coin<SUI>
   ): Position {
     // Provide liquidity
     // Earn trading fees + incentives
   }
   ```

4. **Sui Staking** (Native)
   ```move
   public entry fun stake_sui(
     system: &mut SuiSystemState,
     sui: Coin<SUI>,
     validator: address
   ) {
     // Stake SUI
     // Earn ~3-5% APY
   }
   ```

**Yield Routing**:
```typescript
// Intelligent allocation
if (idleBalance > threshold) {
  // Split across strategies
  allocate(idleBalance, [
    { protocol: 'Scallop', weight: 0.4 },  // Stable lending
    { protocol: 'NAVI', weight: 0.3 },     // Money market
    { protocol: 'Cetus', weight: 0.2 },    // LP rewards
    { protocol: 'SuiStake', weight: 0.1 }  // Native staking
  ])
}
```

---

## Phase 2: Sui Settlement

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   VaultOS on Sui                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌──────────────────┐            │
│  │ Settlement      │  │ Oracle           │            │
│  │ Contract        │  │ Contract         │            │
│  │                 │  │                  │            │
│  │ - Verify sigs   │  │ - Fetch data     │            │
│  │ - Process batch │  │ - Resolve market │            │
│  │ - Distribute    │  │ - Trigger payout │            │
│  └─────────────────┘  └──────────────────┘            │
│           │                     │                      │
│           └──────────┬──────────┘                      │
│                      │                                 │
│              ┌───────▼────────┐                        │
│              │ Yield Router   │                        │
│              │                │                        │
│              │ - Scallop      │                        │
│              │ - NAVI         │                        │
│              │ - Cetus        │                        │
│              │ - Sui Stake    │                        │
│              └────────────────┘                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Settlement Contract (Pseudocode)

```move
module vaultos::settlement {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    struct Channel has key {
        id: UID,
        user: address,
        balance: u64,
        nonce: u64,
        is_open: bool
    }
    
    /// Settle channel with final signed state
    public entry fun settle_channel(
        channel: &mut Channel,
        final_balance: u64,
        nonce: u64,
        signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        // 1. Verify signature
        assert!(verify_signature(
            channel.user,
            final_balance,
            nonce,
            signature
        ), E_INVALID_SIGNATURE);
        
        // 2. Check nonce progression
        assert!(nonce > channel.nonce, E_OLD_STATE);
        
        // 3. Update channel
        channel.balance = final_balance;
        channel.nonce = nonce;
        channel.is_open = false;
        
        // 4. Transfer funds back to user
        let payout = coin::take(
            &mut channel.balance,
            final_balance,
            ctx
        );
        transfer::public_transfer(payout, channel.user);
    }
    
    /// Batch settlement (parallel processing)
    public entry fun batch_settle(
        channels: vector<Channel>,
        states: vector<State>,
        ctx: &mut TxContext
    ) {
        // Sui processes these in parallel!
        let i = 0;
        while (i < vector::length(&channels)) {
            settle_channel(
                vector::borrow_mut(&mut channels, i),
                // ... state params ...
                ctx
            );
            i = i + 1;
        }
    }
}
```

### Oracle Contract (Pseudocode)

```move
module vaultos::oracle {
    use sui::object::{Self, UID};
    use sui::event;
    
    struct Market has key {
        id: UID,
        question: vector<u8>,
        end_time: u64,
        resolved: bool,
        outcome: u8  // 0 = NO, 1 = YES
    }
    
    /// Resolve market with oracle data
    public entry fun resolve_market(
        market: &mut Market,
        outcome: u8,
        oracle_signature: vector<u8>,
        ctx: &mut TxContext
    ) {
        // 1. Verify oracle signature
        assert!(verify_oracle_sig(
            market.id,
            outcome,
            oracle_signature
        ), E_INVALID_ORACLE);
        
        // 2. Check timing
        assert!(
            tx_context::epoch(ctx) > market.end_time,
            E_TOO_EARLY
        );
        
        // 3. Set outcome
        market.resolved = true;
        market.outcome = outcome;
        
        // 4. Emit event for settlement
        event::emit(MarketResolved {
            market_id: object::uid_to_inner(&market.id),
            outcome
        });
    }
}
```

### Why Sui?

**Parallel Execution**:
- Process 1000+ settlements simultaneously
- No sequential bottleneck
- Sub-second finality

**Object Model**:
- Each channel is independent object
- No shared state conflicts
- True parallelism

**Low Latency**:
- ~400ms confirmation time
- Perfect for settlement phase

**DeFi Ecosystem**:
- Native USDC support
- Rich DeFi protocols
- Composable primitives

---

## Performance Characteristics

### Phase 1 (Current)

| Metric | Value | Note |
|--------|-------|------|
| Trade latency | < 100ms | Off-chain |
| Gas cost per trade | $0 | State channel |
| Throughput | 10,000 TPS | Limited by network |
| Session creation | ~2s | On-chain tx |
| Settlement delay | Manual | Phase 2 automation |

### Phase 2 (Target)

| Metric | Value | Note |
|--------|-------|------|
| Settlement latency | < 1s | Sui finality |
| Parallel settlements | 1000+ | Sui parallel exec |
| Oracle resolution | ~5s | Chainlink feed |
| Gas cost | ~$0.01 | Sui low fees |
| Yield APR | 3-8% | Real DeFi |

---

## Security Considerations

### Attack Vectors & Mitigations

**1. Replay Attack**
- **Risk**: Reuse old signed states
- **Mitigation**: Monotonic nonce requirement

**2. State Forgery**
- **Risk**: Fake user signature
- **Mitigation**: Cryptographic verification

**3. Session Hijacking**
- **Risk**: Steal session key
- **Mitigation**: Short expiration, spending limits

**4. Yellow Node Censorship**
- **Risk**: Node ignores user trades
- **Mitigation**: User can exit to L1 anytime

**5. Refund Abuse**
- **Risk**: Repeatedly claim refunds
- **Mitigation**: Max 25%, once per session

**6. Oracle Manipulation** (Phase 2)
- **Risk**: False market resolution
- **Mitigation**: Decentralized oracle + DAO override

### Audit Checklist

- [ ] Signature verification logic
- [ ] Nonce progression enforcement
- [ ] Balance overflow protection
- [ ] Session expiration handling
- [ ] Refund limit enforcement
- [ ] State channel dispute resolution
- [ ] Oracle trust assumptions

---

## Future Enhancements

### Advanced Features

1. **Multi-market Portfolios**
   - Trade across multiple markets
   - Portfolio-level risk management
   - Cross-market hedging

2. **Automated Market Maker**
   - Dynamic pricing based on liquidity
   - Bonding curves
   - Liquidity mining incentives

3. **Social Trading**
   - Follow top traders
   - Copy trading strategies
   - Leaderboards & reputation

4. **Advanced Orders**
   - Limit orders
   - Stop-loss
   - Conditional execution

5. **Mobile App**
   - Native iOS/Android
   - Push notifications
   - Biometric auth

### Scaling Improvements

1. **Channel Factories**
   - One on-chain tx opens multiple channels
   - Reduced setup costs

2. **Watchtowers**
   - Monitor channels 24/7
   - Auto-submit disputes
   - Security-as-a-service

3. **Cross-chain Bridges**
   - Settle on multiple L1s
   - Ethereum, Solana, Polygon support
   - Unified liquidity

---

## Conclusion

VaultOS demonstrates that prediction markets can be:
- **Instant** (< 100ms trades)
- **Gasless** (zero fees during session)
- **Secure** (cryptographic guarantees)
- **Scalable** (10,000+ TPS off-chain)

Phase 1 proves the concept with Yellow Network.  
Phase 2 adds Sui for production-grade settlement.

The future of prediction markets is real-time. 🚀
