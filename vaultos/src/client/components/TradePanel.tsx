import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useMarkets } from '../hooks/useMarkets';
import { apiService } from '../services/apiService';

const TradePanel = () => {
    const { sessionId } = useSession();
    const { activeMarkets } = useMarkets();
    const [selectedMarketId, setSelectedMarketId] = useState('');
    const [shares, setShares] = useState(0);
    const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleTrade = async () => {
        if (!sessionId || !selectedMarketId || shares <= 0) {
            setError('Please ensure all fields are filled correctly.');
            return;
        }

        try {
            const endpoint = tradeType === 'buy' ? '/trade/buy-yes' : '/trade/sell-yes';
            const response = await apiService.post(endpoint, {
                sessionId,
                marketId: selectedMarketId,
                shares,
            });

            if (response.success) {
                setSuccess(`Successfully executed ${tradeType} trade for ${shares} shares.`);
                setError('');
            } else {
                setError('Trade execution failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred while executing the trade.');
        }
    };

    return (
        <div>
            <h2>Trade Panel</h2>
            <select onChange={(e) => setSelectedMarketId(e.target.value)} value={selectedMarketId}>
                <option value="">Select Market</option>
                {activeMarkets.map((market) => (
                    <option key={market.id} value={market.id}>
                        {market.question}
                    </option>
                ))}
            </select>
            <input
                type="number"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                placeholder="Number of Shares"
            />
            <select onChange={(e) => setTradeType(e.target.value)} value={tradeType}>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
            </select>
            <button onClick={handleTrade}>Execute Trade</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default TradePanel;