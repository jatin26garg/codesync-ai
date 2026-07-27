import { WebSocketServer } from "ws";
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";
const wss = new WebSocketServer({
    port: 3002
});

wss.on("connection", (conn, req) => {
    setupWSConnection(conn, req);
});

console.log("Yjs server running on port 3001");