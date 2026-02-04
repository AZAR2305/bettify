import { Market } from '../types'; // Importing Market type from types

class MarketService {
    private markets: Market[] = []; // Array to hold active markets

    // Method to create a new prediction market
    createMarket(question: string, description: string, durationMinutes: number, yesPrice: number): Market {
        const marketId = `market_${this.markets.length + 1}`; // Generate a unique market ID
        const newMarket: Market = {
            id: marketId,
            question,
            description,
            duration: durationMinutes,
            yesPrice,
            noPrice: 1 - yesPrice, // Calculate NO price
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000), // Set expiration time
        };

        this.markets.push(newMarket); // Add new market to the array
        return newMarket; // Return the created market
    }

    // Method to get all active markets
    getActiveMarkets(): Market[] {
        return this.markets.filter(market => market.expiresAt > new Date()); // Filter out expired markets
    }

    // Method to find a market by ID
    getMarketById(marketId: string): Market | undefined {
        return this.markets.find(market => market.id === marketId); // Find market by ID
    }

    // Method to close a market (for future implementation)
    closeMarket(marketId: string): boolean {
        const marketIndex = this.markets.findIndex(market => market.id === marketId);
        if (marketIndex !== -1) {
            this.markets.splice(marketIndex, 1); // Remove market from the array
            return true; // Market closed successfully
        }
        return false; // Market not found
    }
}

export default new MarketService(); // Exporting an instance of MarketService