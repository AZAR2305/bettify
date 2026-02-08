/**
 * Real-Time Community Chat
 * WebSocket-based chat where users can discuss markets
 */
import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type?: 'message' | 'user_joined' | 'user_left';
}

const CommunityChat: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountingRef = useRef(false);
  const isConnectingRef = useRef(false); // NEW: Prevent duplicate connection attempts

  useEffect(() => {
    isUnmountingRef.current = false;
    
    if (isConnected && address) {
      connectWebSocket();
    }

    return () => {
      isUnmountingRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      disconnectWebSocket();
    };
  }, [isConnected, address]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    // Prevent duplicate connections
    if (isConnectingRef.current) {
      console.log('⏸️ Connection attempt already in progress, skipping...');
      return;
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('⏸️ WebSocket already connecting or connected, skipping...');
      return;
    }

    try {
      isConnectingRef.current = true; // Mark as connecting
      setConnectionStatus('connecting');
      const ws = new WebSocket('ws://localhost:3000/community');

      ws.onopen = () => {
        console.log('✅ Connected to community chat');
        setConnectionStatus('connected');
        isConnectingRef.current = false; // Connection established
        
        // Send join message
        ws.send(JSON.stringify({
          type: 'join',
          walletAddress: address
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'joined':
            setOnlineCount(data.onlineCount);
            break;
          case 'history':
            setMessages(data.messages.map((msg: any) => ({
              ...msg,
              type: 'message'
            })));
            break;
          case 'message':
            setMessages(prev => [...prev, {
              id: data.id,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp,
              type: 'message'
            }]);
            break;
          case 'user_joined':
            setMessages(prev => [...prev, {
              id: `system_${Date.now()}`,
              username: 'SYSTEM',
              message: `${data.username} joined the chat`,
              timestamp: data.timestamp,
              type: 'user_joined'
            }]);
            break;
          case 'user_left':
            setMessages(prev => [...prev, {
              id: `system_${Date.now()}`,
              username: 'SYSTEM',
              message: `${data.username} left the chat`,
              timestamp: data.timestamp,
              type: 'user_left'
            }]);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
        isConnectingRef.current = false; // Reset on error
      };

      ws.onclose = () => {
        console.log('🔌 Disconnected from community chat');
        setConnectionStatus('disconnected');
        isConnectingRef.current = false; // Reset on close
        
        // Only reconnect if not unmounting
        if (!isUnmountingRef.current && isConnected && address) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountingRef.current) {
              connectWebSocket();
            }
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      setConnectionStatus('disconnected');
      isConnectingRef.current = false; // Reset on exception
    }
  };

  const disconnectWebSocket = () => {
    isConnectingRef.current = false; // Reset connection flag
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'leave' }));
        }
        wsRef.current.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      wsRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || connectionStatus !== 'connected') return;

    wsRef.current?.send(JSON.stringify({
      type: 'message',
      message: inputMessage.trim()
    }));

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isConnected) {
    return (
      <div className="community-chat" style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-retro)', marginBottom: '10px' }}>[ COMMUNITY CHAT ]</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {'> Connect your wallet to join the chat'}
        </p>
      </div>
    );
  }

  return (
    <div className="community-chat" style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--card-border)',
      borderRadius: '4px',
      padding: '20px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '15px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
        <h3 style={{ color: 'var(--accent-retro)', marginBottom: '5px' }}>[ COMMUNITY CHAT ]</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ color: connectionStatus === 'connected' ? '#4ade80' : '#ef4444' }}>
            {connectionStatus === 'connected' ? '● ONLINE' : '● OFFLINE'}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {onlineCount} user{onlineCount !== 1 ? 's' : ''} online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '15px',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--card-border)',
        borderRadius: '4px'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>
            {'> No messages yet. Start the conversation!'}
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{
              marginBottom: '12px',
              padding: '8px',
              background: msg.type === 'message' ? 'rgba(255, 215, 0, 0.05)' : 'rgba(100, 100, 100, 0.2)',
              borderLeft: msg.type === 'message' ? '3px solid var(--accent-retro)' : '2px solid var(--text-secondary)',
              borderRadius: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{
                  color: msg.type === 'message' ? 'var(--accent-retro)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>
                  {msg.username}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                margin: 0,
                wordBreak: 'break-word',
                fontStyle: msg.type !== 'message' ? 'italic' : 'normal'
              }}>
                {msg.message}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={connectionStatus === 'connected' ? 'Type your message...' : 'Connecting...'}
          disabled={connectionStatus !== 'connected'}
          style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--card-border)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
          style={{
            padding: '10px 20px',
            background: connectionStatus === 'connected' && inputMessage.trim() ? 'var(--accent-retro)' : 'var(--text-secondary)',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: connectionStatus === 'connected' && inputMessage.trim() ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            fontFamily: 'inherit'
          }}
        >
          [SEND]
        </button>
      </div>
    </div>
  );
};

export default CommunityChat;
