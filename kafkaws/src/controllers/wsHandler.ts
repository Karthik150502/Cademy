import WebSocket from "ws";
import { User } from "./index"
import { KafkaHandler } from "./index";
export class WsHandler {

    constructor(private user: User, private ws: WebSocket) {
        this.user = user;
        this.ws = ws;
        this.initialize();
    }

    public initialize() {
        this.ws.onmessage = async (message) => {
            let parsed = JSON.parse(message.data.toString());
            switch (parsed.type) {
                case "start-replay": {
                    let recordingId = parsed.data.recordingId;
                    console.log(`Recording Id: ${recordingId}, played by user: ${this.user.id}`);

                    break;
                }

                default:
                    break;
            }
        }
    }


    public async destroy() {
        this.ws.close();
    }

    public sendMessasge(payload: string) {
        this.ws.send(payload);
    }

}