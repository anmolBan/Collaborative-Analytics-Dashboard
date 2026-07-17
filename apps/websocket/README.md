# WebSocket Deployment

Build the WebSocket service image from the repository root:

```sh
docker build -f Dockerfile.websocket -t collaborative-dashboard-websocket .
```

Run it with the same JWT secret used by the web app:

```sh
docker run --rm -p 8080:8080 \
  -e JWT_SECRET=replace-with-your-secret \
  -e WEBSOCKET_PORT=8080 \
  collaborative-dashboard-websocket
```

The service listens on `WEBSOCKET_PORT`, defaulting to `8080`.
