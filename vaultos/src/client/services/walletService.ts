import { ethers } from 'ethers';

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

export const connectWallet = async (): Promise<void> => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
    } else {
        console.error("Please install a web3 wallet like MetaMask.");
    }
};

export const getWalletAddress = async (): Promise<string | null> => {
    if (signer) {
        return await signer.getAddress();
    }
    return null;
};

export const sendTransaction = async (to: string, amount: string): Promise<void> => {
    if (signer) {
        const tx = {
            to,
            value: ethers.utils.parseEther(amount),
        };
        await signer.sendTransaction(tx);
    } else {
        console.error("Wallet not connected.");
    }
};

export const getProvider = (): ethers.providers.Web3Provider | null => {
    return provider;
};