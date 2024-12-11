export class Env {
    static readonly DEBUG: boolean = process.env.NODE_ENV === 'development';
    static readonly PROD: boolean = process.env.NODE_ENV === 'production';
    static readonly GoogleClientId: string = process.env.GOOGLE_CLIENT_ID as string;
    static readonly GoogleSecret: string = process.env.GOOGLE_CLIENT_SECRET as string;
    static readonly AuthSecret: string = process.env.AUTH_SECRET as string;
    static readonly WsServer: string = process.env.NEXT_PUBLIC_WS_SERVER as string;
    static readonly liveKitApiKey: string = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY as string;
    static readonly liveKitApiSecret: string = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET as string;
    static readonly liveKitUrl: string = process.env.NEXT_PUBLIC_LIVEKIT_URL as string;
}


// export const NEXTAUTH_SCERET = process.env.NEXTAUTH_SECRET as string;
