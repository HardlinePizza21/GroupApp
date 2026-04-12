const onlineUsers = new Map(); 
// userId -> socketId

export function userConnected(userId, socketId) {
  onlineUsers.set(userId, socketId);
}

export function userDisconnected(socketId) {
  for (const [userId, sId] of onlineUsers.entries()) {
    if (sId === socketId) {
      onlineUsers.delete(userId);
      return userId;
    }
  }
}

export function getUserSocket(userId) {
  return onlineUsers.get(userId);
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}