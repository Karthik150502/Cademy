import { Admin, Kafka, Producer } from "kafkajs";
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


    public static async createTopic(topic: string) {
        const instance = this.getInstance();
        await instance.admin.connect();
        await instance.admin.createTopics({
            topics: [{
                topic: topic
            }]
        })
        await instance.admin.disconnect();
    }

    public static produceToTopic(topic: string, payload: string) {
        const producer = this.getInstance().getProducer();
        producer.send({
            topic,
            messages: [
                { value: payload },
            ]
        })
    }


    public static async disconnect() {
        await this.getInstance().producer.disconnect();
    }


}


