import { useState, useEffect } from 'react';
import { connectWallet, getWalletAddress } from '../services/walletService';

const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      const address = await getWalletAddress();
      if (address !== null) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    };

    fetchWalletAddress();
  }, []);

  const connect = async () => {
    await connectWallet();
    const address = await getWalletAddress();
    if (address !== null) {
      setWalletAddress(address);
      setIsConnected(true);
    }
  };

  const disconnect = async () => {
    setWalletAddress(null);
    setIsConnected(false);
  };

  return {
    walletAddress,
    isConnected,
    connect,
    disconnect,
  };
};

export default useWallet;