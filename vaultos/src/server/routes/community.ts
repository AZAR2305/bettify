/**
 * Community Chat WebSocket Server
 * Real-time chat for market participants
 */
import { WebSocketServer, WebSocket } from 'ws';

interface ChatMessage {
  id: string;
  walletAddress: string;
  username: string;
  message: string;
  timestamp: number;
  marketId?: string;
}

interface ConnectedUser {
  ws: WebSocket;
  walletAddress: string;
  username: string;
}

let wss: WebSocketServer | null = null;
const connectedUsers = new Map<WebSocket, ConnectedUser>();
const messageHistory: ChatMessage[] = [];
const MAX_HISTORY = 100;

export function initializeCommunityChat(server: any) {
  wss = new WebSocketServer({ server, path: '/community' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('📡 New community chat connection');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            handleJoin(ws, message);
            break;
          case 'message':
            handleMessage(ws, message);
            break;
          case 'leave':
            handleLeave(ws);
            break;
        }
      } catch (error) {
        console.error('Community chat error:', error);
      }
    });

    ws.on('close', () => {
      handleLeave(ws);
    });

    // Send message history to new connection
    ws.send(JSON.stringify({
      type: 'history',
      messages: messageHistory.slice(-50) // Last 50 messages
    }));
  });

  console.log('✅ Community chat WebSocket server initialized on /community');
}

function handleJoin(ws: WebSocket, data: any) {
  const { walletAddress } = data;
  
  // Create anonymous username from wallet
  const username = `user_${walletAddress.slice(2, 6)}`;
  
  connectedUsers.set(ws, { ws, walletAddress, username });
  
  // Notify all users
  broadcast({
    type: 'user_joined',
    username,
    timestamp: Date.now()
  });

  // Send confirmation to user
  ws.send(JSON.stringify({
    type: 'joined',
    username,
    onlineCount: connectedUsers.size
  }));

  console.log(`✅ User joined: ${username} (${connectedUsers.size} online)`);
}

function handleMessage(ws: WebSocket, data: any) {
  const user = connectedUsers.get(ws);
  if (!user) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not joined' }));
    return;
  }

  const chatMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletAddress: user.walletAddress,
    username: user.username,
    message: data.message,
    timestamp: Date.now(),
    marketId: data.marketId
  };

  // Add to history
  messageHistory.push(chatMessage);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }

  // Broadcast to all connected users
  broadcast({
    type: 'message',
    ...chatMessage
  });
}

function handleLeave(ws: WebSocket) {
  const user = connectedUsers.get(ws);
  if (user) {
    connectedUsers.delete(ws);
    
    broadcast({
      type: 'user_left',
      username: user.username,
      timestamp: Date.now()
    });

    console.log(`❌ User left: ${user.username} (${connectedUsers.size} online)`);
  }
}

function broadcast(message: any) {
  const data = JSON.stringify(message);
  connectedUsers.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

export default { initializeCommunityChat };
