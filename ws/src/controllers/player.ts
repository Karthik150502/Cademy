import { Consumer } from "kafkajs";
import { KafkaHandler, WsHandler } from "./index";
import { CanvasStroke, OutgoingEvents } from "../types";

export class Player {

    private currentOffset: string | null = null;
    private timer: NodeJS.Timeout | null = null
    private consumer: Consumer;
    private prevStrokeTime: number | null = null;
    private isPlaying: boolean = false;
    private ws: WsHandler;
    private recordingId: string;
    constructor(ws: WsHandler, recordingId: string, previousTime: Date) {
        this.consumer = KafkaHandler.getInstance().getConsumer(recordingId);
        this.ws = ws;
        this.recordingId = recordingId;
        this.prevStrokeTime = previousTime.getTime();
        this.consumer.subscribe({
            fromBeginning: true,
            topic: `whiteboard-${recordingId}`,
        });
    }

    public async play() {
        await this.consumer.connect();
        if (this.currentOffset) {
            console.log("currentOffset", this.currentOffset);
            this.consumer.seek({
                topic: `whiteboard-${this.recordingId}`,
                partition: 0,
                offset: this.currentOffset
            })
        }
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!this.isPlaying) {
                    this.isPlaying = true;
                    this.ws.sendMessage(JSON.stringify({
                        type: OutgoingEvents.STARTING_REPLAY
                    }))
                }

                const messageValue = message.value?.toString() as string;
                const payload = JSON.parse(messageValue) as CanvasStroke;
                this.timer = setTimeout(() => {
                    console.log(payload.timeStamp);
                    this.ws.sendMessage(JSON.stringify({
                        type: "stroke-replay",
                        payload: messageValue,
                        offset: message.offset
                    }));
                    this.prevStrokeTime = payload.timeStamp;
                    // this.currentOffset = message.offset;
                    if (this.timer) {
                        clearTimeout(this.timer)
                    }
                }, payload.timeStamp - this.prevStrokeTime!)
            }
        });
    }

    public async disconnect() {
        await this.consumer.stop();
        await this.consumer.disconnect();
        this.isPlaying = false;
    }

    public async pause(offSet: string) {
        this.ws.sendMessage(JSON.stringify({
            type: "pause"
        }))
        if (this.timer) {
            clearTimeout(this.timer);
        };
        this.consumer.disconnect();
        this.consumer.pause([
            {
                topic: `whiteboard-${this.recordingId}`,
            }
        ]);
        this.isPlaying = false;
        this.currentOffset = offSet;
    }

    public async seek(offSet: number) {
        this.currentOffset = `${offSet}`; // Update the currentOffset
        console.log(`Seeked to offset: ${offSet}`);
        this.consumer.seek({
            topic: `whiteboard-${this.recordingId}`,
            partition: 0, // Adjust if multiple partitions
            offset: `${offSet}`,
        });
    }

}