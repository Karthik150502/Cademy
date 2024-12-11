import { config } from "dotenv"
config();

export const PORT = parseInt(process.env.PORT as string) || 8000;
export const DATABASE_URL = process.env.DATABASE_URl!;
export const DEBUG = process.env.NODE_ENV! === 'development';
export const PROD = process.env.NODE_ENV! === 'production';
export const AUTH_SECRET = process.env.AUTH_SECRET!;

export const livekitApiKey = process.env.LIVEKIT_API_KEY as string;
export const livekitApiSecret = process.env.LIVEKIT_API_SECRET as string;
export const liveKitWsUrl = process.env.LIVEKIT_URL as string;
export const liveKitApiUrl = process.env.LIVEKIT_API_URL as string;