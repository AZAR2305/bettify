# VaultOS API Quick Reference

Fast reference for all API endpoints.

## Base URL

```
http://localhost:3000/api
```

---

## Session Endpoints

### Create Session
```http
POST /session/create
```

**Body**:
```json
{
  "depositAmount": 1000
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "sessionId": "session_...",
    "channelId": "0x...",
    "address": "0x...",
    "depositAmount": 1000,
    "expiresIn": 3600
  }
}
```

### Close Session
```http
POST /session/close
```

**Body**:
```json
{
  "sessionId": "session_..."
}
```

---

## Market Endpoints

### Create Market
```http
POST /market/create
```

**Body**:
```json
{
  "question": "Will BTC reach $150k?",
  "description": "Optional description",
  "durationMinutes": 60,
  "yesPrice": 0.55
}
```

### Get All Markets
```http
GET /markets
```

### Get Market Details
```http
GET /market/:marketId
```

---

## Trading Endpoints

### Buy YES
```http
POST /trade/buy-yes
```

**Body**:
```json
{
  "sessionId": "session_...",
  "marketId": "market_...",
  "shares": 100
}
```

### Buy NO
```http
POST /trade/buy-no
```

**Body**:
```json
{
  "sessionId": "session_...",
  "marketId": "market_...",
  "shares": 100
}
```

### Sell YES
```http
POST /trade/sell-yes
```

**Body**:
```json
{
  "sessionId": "session_...",
  "marketId": "market_...",
  "shares": 50
}
```

### Sell NO
```http
POST /trade/sell-no
```

**Body**:
```json
{
  "sessionId": "session_...",
  "marketId": "market_...",
  "shares": 50
}
```

---

## Balance Endpoints

### Move to Idle
```http
POST /balance/move-to-idle
```

**Body**:
```json
{
  "sessionId": "session_...",
  "amount": 200
}
```

### Accrue Yield
```http
POST /balance/accrue-yield
```

**Body**:
```json
{
  "sessionId": "session_..."
}
```

### Request Refund
```http
POST /balance/refund
```

**Body**:
```json
{
  "sessionId": "session_..."
}
```

---

## State Endpoints

### Get State Summary
```http
GET /state/:sessionId
```

**Response**:
```json
{
  "success": true,
  "state": {
    "channelId": "0x...",
    "balances": {
      "active": "950.00",
      "idle": "0.00",
      "yield": "0.00",
      "total": "950.00"
    },
    "positions": [...],
    "refund": {...},
    "version": {...}
  }
}
```

---

## Examples

### Complete Trading Flow

```bash
# 1. Create session
SESSION=$(curl -s -X POST http://localhost:3000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"depositAmount": 1000}' | jq -r '.session.sessionId')

# 2. Create market
MARKET=$(curl -s -X POST http://localhost:3000/api/market/create \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Demo market?",
    "durationMinutes": 30,
    "yesPrice": 0.5
  }' | jq -r '.market.marketId')

# 3. Buy YES shares
curl -X POST http://localhost:3000/api/trade/buy-yes \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION\",
    \"marketId\": \"$MARKET\",
    \"shares\": 100
  }"

# 4. Check state
curl http://localhost:3000/api/state/$SESSION | jq

# 5. Close session
curl -X POST http://localhost:3000/api/session/close \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION\"}"
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (session/market expired) |
| 500 | Server Error |

---

## Rate Limits

Phase 1: No rate limits (demo)
Phase 2: TBD based on usage

---

## WebSocket Support

Phase 2 will add WebSocket for:
- Real-time price updates
- Trade notifications
- Market events

---

For full documentation, see [README.md](README.md)
