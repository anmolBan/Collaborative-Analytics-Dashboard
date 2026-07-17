import { WebSocket } from "ws";

type RoomUser = {
  userId: string;
  name: string;
};

export class RoomManager {
  private static instance: RoomManager;

  private rooms: Map<string, Map<string, { ws: WebSocket; name: string }>> =
    new Map();

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }

    return RoomManager.instance;
  }

  public joinRoom(
    roomId: string,
    userId: string,
    name: string,
    ws: WebSocket,
  ): boolean {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId)!;
    const isNewUser = !room.has(userId);

    room.set(userId, { ws, name });

    return isNewUser;
  }

  public leaveRoom(roomId: string, userId: string, ws: WebSocket): boolean {
    const room = this.rooms.get(roomId);

    if (room) {
      const currentWs = room.get(userId)?.ws;

      if (currentWs === ws) {
        room.delete(userId);

        if (room.size === 0) {
          this.rooms.delete(roomId);
        }

        return true;
      }
    }

    return false;
  }

  public getRoomUsers(roomId: string): RoomUser[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      return [];
    }

    return Array.from(room.entries()).map(([userId, { name }]) => ({
      userId,
      name,
    }));
  }

  public broadcast(roomId: string, message: string, excludeUserId?: string): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    for (const [userId, { ws }] of room.entries()) {
      if (userId === excludeUserId || ws.readyState !== WebSocket.OPEN) {
        continue;
      }

      ws.send(message);
    }
  }

  public getRoomByUserId(userId: string): string | null {
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        return roomId;
      }
    }
    return null;
  }
}
