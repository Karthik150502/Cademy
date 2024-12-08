import { config } from "dotenv";
config();

export const PORT: number = parseInt(process.env.PORT as string) || 8002;
export const ENVIRONMENT: string = process.env.NODE_ENV as string;
export const KAFKA_URL: string = process.env.KAFKA as string;