import { Consumer } from "kafkajs";
import { KafkaHandler } from "./kafkaHandler";

export class Player {


    private currentOffset: number | 0 = 0;
    private timer: NodeJS.Timeout | null = null
    private consumer: Consumer;
    constructor(recordingId: string, userId: string) {
        this.consumer = KafkaHandler.getInstance().getConsumer(recordingId, userId);
        this.consumer.subscribe({
            // topic: `whiteboard-${groupId}`,
            fromBeginning: true,
            topic: `whiteboard-${recordingId}`,
        })
    }

    play() {
        this.consumer.connect();
        this.consumer.run({
            eachMessage: async ({ message }) => {
                console.log(`Message: ${message.value?.toString()}`)
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