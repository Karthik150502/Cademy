import { config } from "dotenv"
config();

export const PORT = parseInt(process.env.PORT as string) || 8000;
export const DATABASE_URL = process.env.DATABASE_URl!;
export const DEBUG = process.env.NODE_EN! === 'development';
export const PROD = process.env.NODE_ENV! === 'production';
export const AUTH_SECRET = process.env.AUTH_SECRET!;