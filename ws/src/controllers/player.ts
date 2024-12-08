import { Consumer } from "kafkajs";
import { KafkaHandler } from "./kafkaHandler";
import { CanvasStroke } from "../types";

export class Player {


    private currentOffset: string | '0' = '0';
    private timer: NodeJS.Timeout | null = null
    private consumer: Consumer;
    private prevStrokeTime: number | null = null;
    constructor(recordingId: string, userId: string) {
        this.consumer = KafkaHandler.getInstance().getConsumer(recordingId, userId);
        this.consumer.subscribe({
            fromBeginning: true,
            topic: `whiteboard-${recordingId}`,
        })
    }

    play(startingTime: Date) {
        this.prevStrokeTime = startingTime.getTime()
        this.consumer.connect();

        this.consumer.run({
            eachMessage: async ({ message }) => {
                let payload = JSON.parse(message.value?.toString() as string) as CanvasStroke;
                this.timer = setTimeout(() => {
                    console.log(payload.timeStamp);
                    this.prevStrokeTime = payload.timeStamp;
                    this.currentOffset = message.offset;
                }, payload.timeStamp - this.prevStrokeTime!)
            }
        });
    }

    pause() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.consumer.disconnect();
    }

    seek() {

    }

}