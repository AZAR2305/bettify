import React, { useEffect, useState } from 'react';
import { createSession, closeSession } from '../services/apiService';
import { useSession } from '../hooks/useSession';

const SessionManager: React.FC = () => {
  const { sessionId, setSessionId } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await createSession(1000); // Deposit 1000 USDC
      setSessionId(response.sessionId);
    } catch (err) {
      setError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    setLoading(true);
    setError(null);
    try {
      await closeSession(sessionId);
      setSessionId(null);
    } catch (err) {
      setError('Failed to close session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally, you can add logic to check session status or handle session expiration
  }, [sessionId]);

  return (
    <div>
      <h2>Session Manager</h2>
      {sessionId ? (
        <div>
          <p>Session ID: {sessionId}</p>
          <button onClick={handleCloseSession} disabled={loading}>
            {loading ? 'Closing...' : 'Close Session'}
          </button>
        </div>
      ) : (
        <button onClick={handleCreateSession} disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SessionManager;