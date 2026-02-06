/**
 * Yellow Network API Routes
 * Handles channel creation, sessions, and balance queries
 */

import express from 'express';
import {
    createECDSAMessageSigner,
    createEIP712AuthMessageSigner,
    createAuthRequestMessage,
    createAuthVerifyMessageFromChallenge,
    createCreateChannelMessage,
} from '@erc7824/nitrolite';
import { createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import WebSocket from 'ws';
import { ethers } from 'ethers';

const router = express.Router();

const CLEARNODE_URL = 'wss://clearnet-sandbox.yellow.com/ws';
const YTEST_USD_ADDRESS = '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb';
const CHAIN_ID = 84532;

/**
 * Create sandbox channel
 * POST /api/yellow/create-channel
 */
router.post('/create-channel', async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress required' });
    }

    if (!process.env.PRIVATE_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
        const walletClient = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http()
        });

        // Generate session key
        const sessionWallet = ethers.Wallet.createRandom();
        const sessionPrivateKey = sessionWallet.privateKey as `0x${string}`;
        const sessionSigner = createECDSAMessageSigner(sessionPrivateKey);

        // Auth parameters
        const authParams = {
            address: account.address,
            session_key: sessionWallet.address,
            application: 'Yellow',
            expires_at: BigInt(Math.floor(Date.now() / 1000) + 7200),
            scope: 'console',
            allowances: [{
                asset: 'ytest.usd',
                amount: '1000000000'
            }],
        };

        const channelId = await new Promise<string>((resolve, reject) => {
            const ws = new WebSocket(CLEARNODE_URL);
            let received = false;

            const timeout = setTimeout(() => {
                if (!received) {
                    ws.close();
                    reject(new Error('Timeout'));
                }
            }, 30000);

            ws.on('open', async () => {
                const authMsg = await createAuthRequestMessage(authParams);
                ws.send(authMsg);
            });

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());

                    if (message.res && message.res[1] === 'auth_challenge') {
                        const challengeData = message.res[2];
                        const challenge = challengeData.challenge_message || challengeData.challenge || challengeData;

                        const eip712Signer = createEIP712AuthMessageSigner(
                            walletClient,
                            {
                                session_key: authParams.session_key,
                                allowances: authParams.allowances,
                                expires_at: authParams.expires_at.toString(),
                                scope: authParams.scope,
                            },
                            { name: authParams.application }
                        );

                        const authVerifyMsg = await createAuthVerifyMessageFromChallenge(
                            eip712Signer,
                            challenge
                        );

                        ws.send(authVerifyMsg);
                    } else if (message.res && message.res[1] === 'auth_verify') {
                        const channelMsg = await createCreateChannelMessage(
                            sessionSigner,
                            {
                                chain_id: CHAIN_ID,
                                token: YTEST_USD_ADDRESS as `0x${string}`,
                            }
                        );

                        ws.send(channelMsg);
                    } else if (message.res && message.res[1] === 'create_channel') {
                        const channelData = message.res[2];

                        if (channelData && channelData.channel_id) {
                            received = true;
                            clearTimeout(timeout);
                            ws.close();
                            resolve(channelData.channel_id);
                        } else if (channelData && channelData.error) {
                            clearTimeout(timeout);
                            ws.close();
                            reject(new Error(channelData.error));
                        }
                    } else if (message.res && message.res[1] === 'error') {
                        const errorData = message.res[2];
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(errorData.error || 'Authentication failed'));
                    }
                } catch (error) {
                    clearTimeout(timeout);
                    ws.close();
                    reject(error);
                }
            });

            ws.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        res.json({
            success: true,
            channelId,
            message: 'Channel created successfully'
        });
    } catch (error: any) {
        console.error('Channel creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create channel'
        });
    }
});

/**
 * Create session
 * POST /api/yellow/create-session
 */
router.post('/create-session', async (req, res) => {
    const { walletAddress, channelId } = req.body;

    if (!walletAddress || !channelId) {
        return res.status(400).json({ error: 'walletAddress and channelId required' });
    }

    try {
        // Generate session ID (in production, store this in database)
        const sessionWallet = ethers.Wallet.createRandom();
        const sessionId = sessionWallet.address;

        res.json({
            success: true,
            sessionId,
            channelId,
            message: 'Session created successfully'
        });
    } catch (error: any) {
        console.error('Session creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create session'
        });
    }
});

/**
 * Get balance
 * GET /api/yellow/balance
 */
router.get('/balance', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: 'address required' });
    }

    try {
        // In production, query actual balance from Yellow Network
        // For now, return ledger balance
        res.json({
            success: true,
            balance: '60', // ytest.USD ledger balance
            asset: 'ytest.usd'
        });
    } catch (error: any) {
        console.error('Balance query error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get balance'
        });
    }
});

export default router;
