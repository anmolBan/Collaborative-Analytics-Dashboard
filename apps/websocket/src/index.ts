import path from "node:path";
import dotenv from "dotenv";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { WebSocket, WebSocketServer, type RawData } from "ws";
import { RoomManager } from "./roomManager";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const AUTH_CLOSE_CODE = 1008;

const port = Number(process.env.WEBSOCKET_PORT ?? 8080);

const websocketServer = new WebSocketServer({
  port,
});
const roomManager = RoomManager.getInstance();

function checkUser(token: string): [string | null, string | null] {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      return [null, null];
    }

    const { userId, name } = decoded as JwtPayload & {
      name?: unknown;
      userId?: unknown;
    };

    if (typeof userId !== "string" || typeof name !== "string") {
      return [null, null];
    }

    return [userId, name];
  } catch {
    return [null, null];
  }
}

type ClientMessage = {
  action?: unknown;
  content?: unknown;
  roomId?: unknown;
};

function parseClientMessage(data: RawData): ClientMessage | null {
  try {
    const parsedData: unknown = JSON.parse(data.toString());

    if (typeof parsedData !== "object" || parsedData === null) {
      return null;
    }

    return parsedData as ClientMessage;
  } catch {
    return null;
  }
}

function sendJson(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
): void {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  ws.send(
    JSON.stringify({
      payload,
      type,
    }),
  );
}

websocketServer.on("connection", (ws: WebSocket, request) => {
  const url = request.url;

  if (!url) {
    ws.close(AUTH_CLOSE_CODE, "Missing request URL");
    return;
  }

  const queryParams = new URL(url, "ws://localhost").searchParams;
  const token = queryParams.get("token") || "";
  const [userId, name] = checkUser(token);

  if (!userId || !name) {
    ws.close(AUTH_CLOSE_CODE, "Invalid token");
    return;
  }

  let currentRoomId: string | null = null;

  console.log(`Client ${userId} connected to collaboration server`);

  sendJson(ws, "connection:ready", {
    message: "Connected to the collaboration server",
    name,
    userId,
  });

  ws.on("message", (data) => {
    try {
      const parsedData = parseClientMessage(data);

      if (!parsedData) {
        sendJson(ws, "error", {
          message: "Invalid JSON message",
        });

        return;
      }

      const { action, roomId, content } = parsedData;

      if (action === "join") {
        if (typeof roomId !== "string" || roomId.length === 0) {
          sendJson(ws, "error", {
            message: "Joining a room requires a non-empty roomId",
          });

          return;
        }

        if (currentRoomId) {
          const removed = roomManager.leaveRoom(currentRoomId, userId, ws);

          if (removed) {
            roomManager.broadcast(
              currentRoomId,
              JSON.stringify({
                type: "user-left",
                userId,
                name,
                users: roomManager.getRoomUsers(currentRoomId),
                timestamp: new Date().toISOString(),
              }),
            );
          }
        }

        currentRoomId = roomId;
        const isNewUser = roomManager.joinRoom(roomId, userId, name, ws);

        sendJson(ws, "room:joined", {
          roomId,
          users: roomManager.getRoomUsers(roomId),
        });

        if (isNewUser) {
          roomManager.broadcast(
            roomId,
            JSON.stringify({
              type: "user-joined",
              userId,
              name,
              users: roomManager.getRoomUsers(roomId),
              timestamp: new Date().toISOString(),
            }),
            userId,
          );
        }

        return;
      }

      if (action === "message" && currentRoomId) {
        roomManager.broadcast(
          currentRoomId,
          JSON.stringify({
            type: "message",
            roomId: currentRoomId,
            userId,
            name,
            content,
            timestamp: new Date().toISOString(),
          }),
          userId,
        );

        return;
      }

      if (action === "canvas-update" && currentRoomId) {
        roomManager.broadcast(
          currentRoomId,
          JSON.stringify({
            type: "canvas-update",
            roomId: currentRoomId,
            userId,
            name,
            content,
            users: roomManager.getRoomUsers(currentRoomId),
            timestamp: new Date().toISOString(),
          }),
          userId,
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    if (currentRoomId) {
      const removed = roomManager.leaveRoom(currentRoomId, userId, ws);
      if (removed) {
        console.log(`Client ${userId} disconnected from room ${currentRoomId}`);
        roomManager.broadcast(
          currentRoomId,
          JSON.stringify({
            type: "user-left",
            userId,
            name,
            users: roomManager.getRoomUsers(currentRoomId),
            timestamp: new Date().toISOString(),
          }),
        );
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket connection error:", error);
  });
});

websocketServer.on("listening", () => {
  console.log(`WebSocket server running at ws://localhost:${port}`);
});

websocketServer.on("error", (error) => {
  console.error("WebSocket server error:", error);
});
