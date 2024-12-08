import { Admin, Consumer, Kafka, Producer } from "kafkajs";
import { KAFKA_URL } from "../lib/config";


export class KafkaHandler {
    private kafka: Kafka = new Kafka({
        clientId: "whiteboard-replay-service",
        brokers: [KAFKA_URL]
    })

    private producer: Producer = this.kafka.producer();
    private admin: Admin = this.kafka.admin();
    private static instance: KafkaHandler | undefined;
    private constructor() {
        this.admin.connect();
        this.producer.connect();
    }

    public getProducer() {
        return this.producer;
    }


    public static getInstance() {
        if (!this.instance) {
            this.instance = new KafkaHandler();
        }
        return this.instance;
    }
}


