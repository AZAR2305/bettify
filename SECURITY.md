# VaultOS Security Model

## Executive Summary

VaultOS uses a **session-based security model** where:
1. Your main wallet stays **offline and safe**
2. A temporary **session key** handles trading
3. Every action is **cryptographically signed**
4. The Yellow node is **NOT trusted**
5. You can always **prove the correct state**

---

## Why Traditional Prediction Markets are Risky

### Problem 1: Wallet Exposure

**Traditional approach**:
```
Every trade = Wallet signature required
More trades = More exposure
Risk = Linearly increases with activity
```

**Real-world analogy**: Using your bank PIN for every coffee purchase

### Problem 2: Gas Fees

**Traditional approach**:
```
Every trade = On-chain transaction
Every transaction = $1-50 gas fee
Active trading = Unsustainable costs
```

**Real-world analogy**: Paying a $20 wire transfer fee for every trade

### Problem 3: Latency

**Traditional approach**:
```
Submit trade → Wait for block → Confirm
Latency: 15-60 seconds
Price changes while waiting
Frontrunning opportunities
```

**Real-world analogy**: Placing a stock trade that takes 60 seconds to execute

---

## VaultOS Solution: Session Keys + State Channels

### Architecture

```
┌────────────────────────────────────────────────────────┐
│                Main Wallet (Cold)                      │
│  - Never exposed during trading                        │
│  - Used once: Deposit funds                            │
│  - Used once: Withdraw funds                           │
│  - Private key stays safe                              │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ Creates & authorizes
                   ↓
┌────────────────────────────────────────────────────────┐
│              Session Key (Hot, Limited)                │
│  - Temporary key for this session only                 │
│  - Spending limit: Max 1000 USDC                       │
│  - Time limit: Expires in 1 hour                       │
│  - Scope limit: Can only trade                         │
│  - Revocable: Main wallet can cancel anytime           │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ Signs all trades
                   ↓
┌────────────────────────────────────────────────────────┐
│           Yellow Network State Channel                 │
│  - Off-chain trade execution                           │
│  - Instant updates (< 100ms)                           │
│  - Zero gas fees                                       │
│  - Cryptographic proofs maintained                     │
└────────────────────────────────────────────────────────┘
```

---

## Session Key Properties

### 1. Limited Permissions

**What session key CAN do**:
- ✅ Sign trade executions
- ✅ Update off-chain state
- ✅ Request partial refund (max 25%)

**What session key CANNOT do**:
- ❌ Withdraw to different address
- ❌ Spend beyond allowance
- ❌ Operate after expiration
- ❌ Access other sessions

### 2. Bounded Risk

```typescript
SessionKey {
  // Financial limit
  maxAllowance: 1000 USDC    // Maximum possible loss
  
  // Time limit
  duration: 3600 seconds     // Auto-expires in 1 hour
  
  // Usage limit
  maxRefund: 25%             // Limited emergency exit
  
  // Revocable
  canBeRevoked: true         // Main wallet can cancel
}
```

**Maximum risk exposure**:
- Worst case: Lose session allowance (1000 USDC)
- Compared to: Main wallet compromised (entire balance)
- Reduction: 100x - 1000x safer

### 3. Time-Bounded Expiration

```typescript
// Session lifecycle
t=0:     Session created
t=3600:  Session expires (automatic)
t>3600:  Session key becomes useless

// No action required - automatic security
```

**Real-world analogy**: Hotel room key that stops working after checkout

---

## Why Yellow Node is NOT Trusted

### Threat Model

**What if Yellow node is malicious?**

❌ **Cannot forge signatures**
```
Node tries: Submit fake trade
Result: Signature verification fails
User wins: Invalid signature rejected
```

❌ **Cannot steal funds**
```
Node tries: Withdraw to attacker address
Result: Session key lacks permission
User wins: Transaction rejected
```

❌ **Cannot replay old states**
```
Node tries: Use old state with higher balance
Result: Nonce check fails (old < new)
User wins: Newer state enforced
```

❌ **Cannot censor indefinitely**
```
Node tries: Ignore user's trades
Result: User exits to L1 with signed state
User wins: Funds recovered on-chain
```

### Cryptographic Guarantees

Every state update creates an **immutable proof**:

```typescript
// State update structure
StateUpdate {
  channelId: "0xABC..."       // Unique channel identifier
  nonce: 42,                  // Monotonically increasing
  balance: 950000000,         // New balance (USDC)
  timestamp: 1738627200,      // When created
  signature: "0xDEF..."       // User's cryptographic proof
}

// Properties
- Signature proves authenticity
- Nonce prevents replay attacks
- Balance is cryptographically committed
- Timestamp provides ordering
```

### Verification Process

```typescript
function verifyState(state: StateUpdate, userAddress: Address): boolean {
  // 1. Reconstruct message
  const message = hash(
    state.channelId,
    state.nonce,
    state.balance
  )
  
  // 2. Recover signer
  const signer = recoverSigner(message, state.signature)
  
  // 3. Verify signer is user
  if (signer !== userAddress) {
    return false  // ❌ Forged signature
  }
  
  // 4. Check nonce progression
  if (state.nonce <= previousNonce) {
    return false  // ❌ Replay attack
  }
  
  return true  // ✅ Valid state
}
```

**Key insight**: Math > Trust

---

## Dispute Resolution

### Scenario: Malicious Yellow Node

**Attack**: Node tries to settle with old state (higher balance for node)

```
Actual states:
  State 100: User has 1000 USDC
  State 101: User has 950 USDC (after trade)
  State 102: User has 900 USDC (after trade)
  
Node submits: State 100 (trying to steal 100 USDC)
```

**User defense**:

```typescript
// 1. User detects fraud
if (settledState.nonce < myLatestState.nonce) {
  // Node is lying!
  
  // 2. Submit correct state to L1
  submitDisputeToBlockchain(
    channelId: "0xABC...",
    state: myLatestState,        // State 102
    signature: mySignature        // Cryptographic proof
  )
  
  // 3. Smart contract verifies
  //    - Signature is valid ✅
  //    - Nonce 102 > Nonce 100 ✅
  //    - Balance is correct ✅
  
  // 4. Correct state enforced
  //    User receives 900 USDC ✅
}
```

**Outcome**: User always wins with valid signature

### Why This Works

**Blockchain as arbiter**:
- Smart contract is trustless
- Math cannot be fooled
- Latest valid state wins
- User maintains proof

**Deterrence**:
- Node knows it will lose dispute
- No incentive to cheat
- Rational nodes behave honestly

---

## Security Guarantees

### What VaultOS Guarantees

✅ **Your funds are safe**
- Session key limits exposure
- Cryptographic proofs protect state
- L1 fallback available

✅ **You control your money**
- You sign every state update
- You can dispute wrong settlement
- You maintain all proofs

✅ **No one can forge your trades**
- Only session key can sign
- Signatures are mathematically verifiable
- Replay attacks prevented by nonce

✅ **You can always exit**
- Submit state to L1 anytime
- 25% refund available in session
- Main wallet can revoke session

### What VaultOS Does NOT Guarantee

⚠️ **Phase 1 limitations**:

❌ Not guaranteed: Market resolution accuracy
- Phase 1 uses manual resolution
- Phase 2 adds oracle verification

❌ Not guaranteed: Yield returns
- Phase 1 simulates yield
- Phase 2 uses real Sui DeFi

❌ Not guaranteed: Settlement speed
- Phase 1 simulates settlement
- Phase 2 adds Sui blockchain

These are **explicitly scoped** for Phase 1 MVP.

---

## Attack Scenarios & Mitigations

### 1. Session Key Theft

**Attack**: Attacker steals session private key

**Impact**: 
- Attacker can trade with session allowance
- Maximum loss: Session allowance (1000 USDC)

**Mitigation**:
- Spending limit reduces damage
- Session expires automatically
- Main wallet can revoke early
- Much better than main wallet theft

**Comparison**:
```
Main wallet theft:  Lose everything
Session key theft:  Lose max 1000 USDC
Improvement:        100x - 1000x safer
```

### 2. Replay Attack

**Attack**: Reuse old signed state

**Defense**: Monotonic nonce

```typescript
// Every state has increasing nonce
State 1: nonce = 1
State 2: nonce = 2
State 3: nonce = 3

// Attack attempt
Attacker: Submit State 1 (nonce = 1)
System: Reject (current nonce = 3 > 1)
```

**Result**: Attack fails ✅

### 3. Yellow Node Collusion

**Attack**: All Yellow nodes collude to steal funds

**Defense**: L1 fallback

```typescript
// User always has escape hatch
if (nodesAreEvil) {
  // 1. Close session
  closeSession()
  
  // 2. Submit final state to blockchain
  submitToL1(
    mySignedState,
    myBalance,
    myProof
  )
  
  // 3. Smart contract enforces correct state
  // 4. User receives correct payout
}
```

**Result**: User escapes with funds ✅

### 4. State Channel Griefing

**Attack**: Node refuses to process trades

**Impact**: User cannot trade (DoS)

**Defense**: 
- Switch to different Yellow node
- Exit to L1 with current state
- No funds lost

**Result**: Temporary inconvenience only

### 5. Oracle Manipulation (Phase 2)

**Attack**: False market resolution

**Mitigation**:
- Decentralized oracle (Chainlink)
- Multiple data sources
- DAO override for disputes
- Economic penalties for manipulation

---

## Security Best Practices

### For Users

✅ **DO**:
- Keep main wallet offline
- Use session keys for trading
- Monitor session expiration
- Review state regularly
- Save signed states as backup

❌ **DON'T**:
- Share session private key
- Use excessive allowances
- Ignore expiration warnings
- Trust Yellow node blindly

### For Developers

✅ **DO**:
- Verify all signatures
- Enforce nonce progression
- Implement timeouts
- Add L1 fallback
- Audit smart contracts

❌ **DON'T**:
- Trust node data without verification
- Skip signature checks
- Allow nonce replay
- Forget emergency exits

---

## Phase 2 Security Enhancements

### Additional Protections

1. **Multi-sig Settlement**
   ```move
   // Require multiple signatures to settle
   public entry fun settle_channel(
     user_sig: vector<u8>,
     oracle_sig: vector<u8>,
     node_sig: vector<u8>
   ) {
     // All must be valid
   }
   ```

2. **Timelock Withdrawals**
   ```move
   // Delay withdrawals for dispute window
   public entry fun withdraw(amount: u64) {
     create_timelock(24 hours);
     // Allows time for challenges
   }
   ```

3. **Watchtower Services**
   ```typescript
   // Monitor channels 24/7
   watchtower.monitor(channelId, {
     onFraud: (evidence) => {
       submitDisputeToL1(evidence);
     }
   });
   ```

4. **Insurance Fund**
   ```move
   // Backstop for edge cases
   public entry fun insure_channel(
     channel: &Channel,
     premium: Coin<USDC>
   ) {
     // Covers extreme scenarios
   }
   ```

---

## Comparison: VaultOS vs Traditional

### Security

| Aspect | Traditional | VaultOS |
|--------|-------------|---------|
| Wallet exposure | Every trade | Once per session |
| Maximum risk | Entire balance | Session allowance |
| Dispute resolution | Hard/impossible | Cryptographic proof |
| Fraud protection | Trust-based | Math-based |
| Emergency exit | N/A | 25% refund |

### Performance

| Aspect | Traditional | VaultOS |
|--------|-------------|---------|
| Trade speed | 15-60s | < 100ms |
| Gas per trade | $1-50 | $0 |
| Throughput | ~15 TPS | 10,000+ TPS |
| UX | Clunky | Seamless |

---

## Conclusion

VaultOS achieves **Web2 UX with Web3 security**:

🔐 **Security**:
- Session keys limit exposure
- Cryptographic proofs prevent fraud
- L1 fallback for disputes
- No trust assumptions

⚡ **Performance**:
- Instant trades (< 100ms)
- Zero gas fees
- High throughput

🎯 **Usability**:
- Main wallet stays safe
- Simple session model
- Automatic expiration
- Clear risk bounds

**The future of prediction markets is both fast AND secure.** 🚀

---

## Further Reading

- [Yellow Network Whitepaper](https://yellow.org/whitepaper)
- [State Channel Security](https://docs.ethhub.io/ethereum-roadmap/layer-2-scaling/state-channels/)
- [Cryptographic Signatures](https://en.wikipedia.org/wiki/Digital_signature)
- [Sui Security Model](https://docs.sui.io/concepts/security)

---

**Questions? Read the code - it's the ultimate documentation!**
