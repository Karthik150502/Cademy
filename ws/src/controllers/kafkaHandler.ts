import { Admin, Kafka, Producer } from "kafkajs";
import { KAFKA_URL } from "../lib/config";
import { randomUUID } from "crypto";

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
    public getConsumer(groupId: string) {
        return this.kafka.consumer({ groupId: `${groupId}-${randomUUID()}` });
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
                topic: topic,
                numPartitions: 1,
                replicationFactor: 1,
                configEntries: [
                    { name: 'retention.ms', value: '-1' }, // Retain logs forever
                ],
            }]
        })
        await instance.admin.disconnect();
    }


    public static async connectProducer() {
        const producer = this.getInstance().getProducer();
        await producer.connect();
    }

    public static async produceToTopic(topic: string, payload: string) {
        const producer = this.getInstance().getProducer();
        await producer.send({
            topic,
            messages: [
                { value: payload },
            ]
        })
    }




    public static async disconnectProducer() {
        await this.getInstance().producer.disconnect();
    }


}


