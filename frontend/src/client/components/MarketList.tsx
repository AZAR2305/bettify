/**
 * Prediction Markets List
 * 
 * Connected to backend API at /api/markets
 * Shows prediction market cards with retro-brutalist theme
 * Markets display YES/NO prices, volume, and timing
 */
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import CreateMarketForm from './CreateMarketForm';
import { API_URL } from '../config/api';

interface Market {
  id: string;
  marketId?: string;
  question: string;
  description?: string;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  endTime?: string;
  category: string;
  status?: string;
  odds?: {
    YES: string;
    NO: string;
  };
}

interface MarketListProps {
  session?: any;
  onSelectMarket?: (market: Market) => void;
}

const MarketList: React.FC<MarketListProps> = ({ session, onSelectMarket }) => {
  const { address } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch markets from backend
  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/markets`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched markets from API:', data);
        console.log('📊 Number of markets:', data.markets?.length || 0);
        
        const formattedMarkets = data.markets.map((m: any) => ({
          id: m.id,
          marketId: m.id.toUpperCase(),
          question: m.question,
          description: m.description || '',
          // FIX: Odds are already in decimal (0.5000), not percentage (50.00)
          yesPrice: m.odds?.YES ? parseFloat(m.odds.YES) : 0.5,
          noPrice: m.odds?.NO ? parseFloat(m.odds.NO) : 0.5,
          totalVolume: parseFloat(m.totalVolume) || 0,
          endTime: m.endTime ? new Date(m.endTime).toLocaleDateString() : 'TBD',
          category: 'PREDICTION',
          status: m.status
        }));
        console.log('📊 Formatted markets:', formattedMarkets);
        setMarkets(formattedMarkets);
        setError('');
      } else {
        console.error('❌ Failed to load markets:', response.status, response.statusText);
        setError('Failed to load markets');
        setMarkets([]);
      }
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError('Network error - could not load markets');
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'CRYPTO', 'TECH', 'ECONOMICS', 'STOCKS', 'SPACE'];
  const filteredMarkets = selectedCategory === 'ALL' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  const handleMarketCreated = () => {
    setShowCreateForm(false);
    fetchMarkets(); // Refresh markets list
  };

  return (
    <div>
      <div className="market-header">
        <div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontFamily: 'Syne, sans-serif', 
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Active Markets
          </h2>
          <p style={{ color: 'var(--accent-retro)', fontSize: '0.85rem' }}>
            {'[ POWERED BY YELLOW NETWORK • ZERO GAS • INSTANT EXECUTION ]'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            fontFamily: 'Space Mono, monospace',
            textTransform: 'uppercase',
            background: showCreateForm ? 'var(--text-secondary)' : 'var(--accent-retro)',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? '[CANCEL]' : '[+ CREATE MARKET]'}
        </button>
      </div>

      {/* Create Market Form */}
      {showCreateForm && (
        <CreateMarketForm 
          onMarketCreated={handleMarketCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Category Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px', 
        flexWrap: 'wrap' 
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            [{cat}]
          </button>
        ))}
      </div>

      {/* Markets Grid */}
      {loading && <p>Loading markets...</p>}
      {error && <p style={{ color: 'var(--accent-retro)' }}>{error}</p>}
      {!loading && !error && filteredMarkets.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>
          No markets found. Create one to get started!
        </p>
      )}
      {!loading && !error && filteredMarkets.length > 0 && (
        <p style={{ color: 'var(--accent-green)', marginBottom: '20px' }}>
          📊 Showing {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''}
        </p>
      )}
      <div className="markets-grid">
        {filteredMarkets.map((market) => (
          <div 
            key={market.id} 
            className="market-card"
            onClick={() => onSelectMarket && onSelectMarket(market)}
          >
            <div className="market-card-header">
              {market.marketId} • {market.category}
            </div>
            
            <div className="market-card-body">
              <h3>{market.question}</h3>
              
              {market.description && (
                <p className="market-description">{market.description}</p>
              )}
              
              <div className="market-prices">
                <div className="price-box yes">
                  <span className="label">YES</span>
                  <span className="price">${(market.yesPrice).toFixed(2)}</span>
                </div>
                <div className="price-box no">
                  <span className="label">NO</span>
                  <span className="price">${(market.noPrice).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="market-info">
                <span>VOL: ${(market.totalVolume / 1000).toFixed(0)}K</span>
                <span>END: {market.endTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketList;
