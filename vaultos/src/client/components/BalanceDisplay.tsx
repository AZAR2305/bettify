import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useSession } from '../hooks/useSession';

const BalanceDisplay: React.FC = () => {
    const { wallet } = useWallet();
    const { session } = useSession();

    if (!wallet || !session) {
        return <div>Please connect your wallet and start a session.</div>;
    }

    return (
        <div>
            <h2>Your Balance</h2>
            <p>Active Balance: {session.state.balances.active} USDC</p>
            <p>Idle Balance: {session.state.balances.idle} USDC</p>
            <p>Yield Accrued: {session.state.yield} USDC</p>
            <h3>Your Positions</h3>
            {session.state.positions.map((position) => (
                <div key={position.marketId}>
                    <p>Market ID: {position.marketId}</p>
                    <p>YES Shares: {position.yesShares}</p>
                    <p>NO Shares: {position.noShares}</p>
                    <p>Invested: {position.invested} USDC</p>
                </div>
            ))}
        </div>
    );
};

export default BalanceDisplay;