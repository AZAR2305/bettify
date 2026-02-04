import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return (
    <div className="wallet-connect">
      <h2>💼 Wallet Connection</h2>
      {isConnected && address ? (
        <div className="wallet-info">
          <p className="wallet-address">
            <strong>Address:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {balance && (
            <p className="wallet-balance">
              <strong>Balance:</strong> {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          )}
          <button onClick={() => disconnect()} className="btn btn-danger">
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="connect-options">
          <p>Connect your wallet to start trading</p>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="btn btn-primary"
            >
              Connect with {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;