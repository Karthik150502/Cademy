"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const user_1 = require("./controllers/user");
const config_1 = require("./lib/config");
const wss = new ws_1.WebSocketServer({
    port: config_1.PORT
});
wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const userId = urlParams.get('userId');
    const user = new user_1.User(ws, userId);
    console.log(`User connected: ${user.id}`);
    ws.on("error", (error) => {
        console.log("Error connecting to the Websocket connection.");
        console.error(error);
    });
    ws.onclose = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User disconnected: ${user.id}`);
        yield user.close();
    });
});
