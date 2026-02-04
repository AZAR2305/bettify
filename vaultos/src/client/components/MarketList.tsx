import React from 'react';
import { useMarkets } from '../hooks/useMarkets';

const MarketList: React.FC = () => {
    const { markets, loading, error } = useMarkets();

    if (loading) {
        return <div>Loading markets...</div>;
    }

    if (error) {
        return <div>Error loading markets: {error.message}</div>;
    }

    return (
        <div>
            <h2>Active Markets</h2>
            <ul>
                {markets.map((market) => (
                    <li key={market.id}>
                        <h3>{market.question}</h3>
                        <p>{market.description}</p>
                        <p>YES Price: ${market.yesPrice}</p>
                        <p>NO Price: ${1 - market.yesPrice}</p>
                        <p>Duration: {market.durationMinutes} minutes</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MarketList;