

import { WebSocket, WebSocketServer } from "ws";
import { User } from "./controllers/user";



const wss = new WebSocketServer({
    port: 8001
})


wss.on("connection", (ws: WebSocket) => {
    console.log(`User connected on....`);
    const user: User = new User(ws);
    ws.on("error", (error) => {
        console.log("Error connecting to the Websocket connection.");
        console.error(error);
    });



    ws.onclose = () => {
        console.log("User disconnected....", user.id!);
        user.destroy();
    }
})
