/**
 * Sui Settlement Service
 * 
 * Writes final market resolutions to Sui blockchain for transparent verification.
 * Trading happens off-chain via Yellow Network, but settlement is recorded on-chain.
 */

import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/sui.js/utils";

interface SettlementParams {
    marketId: string;
    winningOutcome: 'YES' | 'NO';
    totalPool: bigint;  // In USDC (6 decimals)
}

interface SettlementResult {
    success: boolean;
    transactionDigest?: string;
    settlementObjectId?: string;
    error?: string;
}

export class SuiSettlementService {
    private client: SuiClient;
    private adminKeypair: Ed25519Keypair | null = null;
    private packageId: string;
    private enabled: boolean;

    constructor() {
        // Initialize Sui client
        this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
        
        // Load config from environment
        this.packageId = process.env.SUI_PACKAGE_ID || '';
        this.enabled = !!this.packageId;

        // Load admin keypair if available
        const adminSecretKey = process.env.SUI_ADMIN_SECRET_KEY;
        if (adminSecretKey) {
            try {
                // Secret key format: "suiprivkey..." base64 encoded
                const secretKeyBytes = fromB64(adminSecretKey.replace('suiprivkey', ''));
                this.adminKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
            } catch (error) {
                console.error('[SuiSettlement] Failed to load admin keypair:', error);
            }
        }

        if (!this.enabled) {
            console.warn('[SuiSettlement] Sui integration disabled - SUI_PACKAGE_ID not set');
        } else {
            console.log('[SuiSettlement] Sui integration enabled');
            console.log(`[SuiSettlement] Package ID: ${this.packageId}`);
        }
    }

    /**
     * Submit market settlement to Sui blockchain
     * This creates a shared Settlement object on-chain
     */
    async submitSettlement(params: SettlementParams): Promise<SettlementResult> {
        if (!this.enabled) {
            return {
                success: false,
                error: 'Sui integration not enabled (missing SUI_PACKAGE_ID)'
            };
        }

        if (!this.adminKeypair) {
            return {
                success: false,
                error: 'Admin keypair not configured (missing SUI_ADMIN_SECRET_KEY)'
            };
        }

        try {
            const tx = new TransactionBlock();

            // Convert outcome to u8 (1 = YES, 0 = NO)
            const outcomeValue = params.winningOutcome === 'YES' ? 1 : 0;

            // Convert marketId to vector<u8>
            const marketIdBytes = Array.from(Buffer.from(params.marketId, 'utf-8'));

            // Convert totalPool to u64 (Sui uses u64 for amounts)
            const totalPoolU64 = Number(params.totalPool);

            // Call create_settlement function
            tx.moveCall({
                target: `${this.packageId}::prediction_settlement::create_settlement`,
                arguments: [
                    tx.pure(marketIdBytes),        // market_id: vector<u8>
                    tx.pure(outcomeValue),         // winning_outcome: u8
                    tx.pure(totalPoolU64),         // total_pool: u64
                ],
            });

            // Sign and execute transaction
            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.adminKeypair,
                transactionBlock: tx,
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            });

            // Extract settlement object ID from created objects
            let settlementObjectId: string | undefined;
            if (result.objectChanges) {
                const createdObject = result.objectChanges.find(
                    (change) => change.type === 'created'
                );
                if (createdObject && createdObject.type === 'created') {
                    settlementObjectId = createdObject.objectId;
                }
            }

            console.log('[SuiSettlement] Settlement submitted successfully');
            console.log(`[SuiSettlement] TX Digest: ${result.digest}`);
            console.log(`[SuiSettlement] Settlement Object: ${settlementObjectId}`);

            return {
                success: true,
                transactionDigest: result.digest,
                settlementObjectId,
            };

        } catch (error) {
            console.error('[SuiSettlement] Failed to submit settlement:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get settlement info from Sui (read-only)
     */
    async getSettlement(settlementObjectId: string): Promise<any> {
        if (!this.enabled) {
            throw new Error('Sui integration not enabled');
        }

        try {
            const object = await this.client.getObject({
                id: settlementObjectId,
                options: { showContent: true },
            });

            return object;
        } catch (error) {
            console.error('[SuiSettlement] Failed to fetch settlement:', error);
            throw error;
        }
    }

    /**
     * Check if Sui integration is ready
     */
    isReady(): boolean {
        return this.enabled && !!this.adminKeypair;
    }

    /**
     * Get current admin address
     */
    getAdminAddress(): string | null {
        if (!this.adminKeypair) return null;
        return this.adminKeypair.getPublicKey().toSuiAddress();
    }
}

// Singleton instance
export const suiSettlement = new SuiSettlementService();
