import { WebSocketServer } from "ws";

const port = Number(process.env.WEBSOCKET_PORT ?? 8080);

const websocketServer = new WebSocketServer({
  port,
});

websocketServer.on("connection", (socket) => {
  console.log("WebSocket client connected");

  socket.send(
    JSON.stringify({
      type: "connection:ready",
      payload: {
        message: "Connected to the collaboration server",
      },
    }),
  );

  socket.on("message", (message) => {
    console.log("Received:", message.toString());
  });

  socket.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  socket.on("error", (error) => {
    console.error("WebSocket connection error:", error);
  });
});

websocketServer.on("listening", () => {
  console.log(`WebSocket server running at ws://localhost:${port}`);
});

websocketServer.on("error", (error) => {
  console.error("WebSocket server error:", error);
});