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
exports.WsHandler = void 0;
const index_1 = require("./index");
class WsHandler {
    constructor(user, ws) {
        this.user = user;
        this.ws = ws;
        this.user = user;
        this.ws = ws;
        console.log(`whiteboard-${this.user.id}`);
        this.producer = index_1.KafkaHandler.getProducer(`whiteboard-${this.user.id}`);
        this.consumer = index_1.KafkaHandler.getConsumer(this.user.id, `whiteboard-${this.user.id}`);
        this.initialize();
    }
    initialize() {
        this.ws.onmessage = (message) => __awaiter(this, void 0, void 0, function* () {
            let parsed = JSON.parse(message.data.toString());
            switch (parsed.type) {
                case "start-replay": {
                    let recordingId = parsed.data.recordingId;
                    console.log(`Recording Id: ${recordingId}, played by user: ${this.user.id}`);
                    // await KafkaHandler.startProducing(this.producer, recordingId);
                    // console.log(`whiteboard-${this.user.id}`)
                    // this.consumeLogs();
                    break;
                }
                default:
                    break;
            }
        });
    }
    consumeLogs() {
        var _a;
        (_a = this.consumer) === null || _a === void 0 ? void 0 : _a.consume(this);
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.ws.close();
            yield this.producer.closeProducer();
            yield ((_a = this.consumer) === null || _a === void 0 ? void 0 : _a.closeConsumer());
        });
    }
    sendMessasge(payload) {
        this.ws.send(payload);
    }
}
exports.WsHandler = WsHandler;
