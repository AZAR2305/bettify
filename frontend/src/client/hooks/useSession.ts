import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const useSession = (walletAddress) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await apiService.createSession(walletAddress);
        setSessionId(response.sessionId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      createSession();
    }
  }, [walletAddress]);

  const closeSession = async () => {
    if (!sessionId) return;

    try {
      await apiService.closeSession(sessionId);
      setSessionId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return { sessionId, loading, error, closeSession };
};

export default useSession;