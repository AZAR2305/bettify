import { useEffect, useState } from 'react';
import apiService from '../services/apiService';

const useMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarkets = async () => {
    try {
      const response = await apiService.getMarkets();
      setMarkets(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return { markets, loading, error };
};

export default useMarkets;