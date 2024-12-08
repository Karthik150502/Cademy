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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaHandler = exports.ConsumerHandler = exports.ProducerHandler = void 0;
const kafkajs_1 = require("kafkajs");
const config_1 = require("../lib/config");
const prisma_1 = __importDefault(require("../lib/prisma"));
class ProducerHandler {
    constructor(kafka, topic) {
        this.producer = kafka.producer();
        this.topic = topic;
    }
    produce(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            yield ((_b = this.producer) === null || _b === void 0 ? void 0 : _b.connect());
            yield ((_c = this.producer) === null || _c === void 0 ? void 0 : _c.send({
                topic: this.topic,
                messages: [{
                        value: value,
                    }]
            }));
        });
    }
    closeProducer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.producer.disconnect();
        });
    }
}
exports.ProducerHandler = ProducerHandler;
class ConsumerHandler {
    constructor(kafka, groupId, topic) {
        this.consumer = kafka.consumer({ groupId });
        this.topic = topic;
    }
    consume(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Consuming.");
            yield this.consumer.connect();
            yield this.consumer.subscribe({
                topic: this.topic, fromBeginning: true
            });
            yield this.consumer.run({
                eachMessage: (_b) => __awaiter(this, [_b], void 0, function* ({ topic, partition, message }) {
                    var _c;
                    // TODO: ws event to the client to update the canvas.
                    ws.sendMessasge(JSON.stringify({
                        topic, partition, message
                    }));
                    console.log({
                        offset: message.offset,
                        value: (_c = message === null || message === void 0 ? void 0 : message.value) === null || _c === void 0 ? void 0 : _c.toString(),
                    });
                }),
            });
        });
    }
    closeConsumer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.consumer.disconnect();
        });
    }
}
exports.ConsumerHandler = ConsumerHandler;
class KafkaHandler {
    constructor() {
    }
    static getProducer(topic) {
        return new ProducerHandler(this.kafka, topic);
    }
    static getConsumer(groupId, topic) {
        return new ConsumerHandler(this.kafka, groupId, topic);
    }
    static startProducing(producer, recordingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const whiteboard = yield this.getWhiteboardDetails(recordingId);
            if (!whiteboard) {
                return;
            }
            const { startedAt, initialState, subStates } = whiteboard;
            const startedAtms = new Date(startedAt).getTime();
            yield producer.produce(initialState);
            yield producer.produce(subStates);
            // let strokes = JSON.parse(subStates);
        });
    }
    static getWhiteboardDetails(recordingId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield prisma_1.default.meetingRecording.findUnique({
                where: {
                    id: recordingId
                }
            });
            if (!result) {
                return;
            }
            return { startedAt: result.createdAt, initialState: result.initialState, subStates: result.subsequentStates };
        });
    }
}
exports.KafkaHandler = KafkaHandler;
_a = KafkaHandler;
KafkaHandler.kafka = new kafkajs_1.Kafka({
    clientId: "whiteboard-replay-service",
    brokers: [config_1.KAFKA_URL]
});
KafkaHandler.admin = _a.kafka.admin();
KafkaHandler.producer = _a.kafka.producer();
