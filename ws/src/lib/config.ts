import { config } from "dotenv";
config();

export const PROD = process.env.NODE_ENV! === "production";
export const KAFKA_URL = process.env.KAFKA_URL as string;

export const REDIS_HOST = process.env.REDIS_HOST! as string;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT! as string);