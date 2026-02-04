import React, { useEffect, useState } from 'react';
import { connectWallet, getWalletAddress } from '../services/walletService';

const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      setIsConnected(true);
    }
  };

  useEffect(() => {
    const fetchWalletAddress = async () => {
      const address = await getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    };

    fetchWalletAddress();
  }, []);

  return (
    <div>
      <h2>Wallet Connection</h2>
      {isConnected ? (
        <div>
          <p>Connected: {walletAddress}</p>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;