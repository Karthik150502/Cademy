export class Env {
    static readonly DEBUG: boolean = process.env.NODE_ENV === 'development';
    static readonly PROD: boolean = process.env.NODE_ENV === 'production';
    static readonly GoogleClientId: string = process.env.GOOGLE_CLIENT_ID as string;
    static readonly GoogleSecret: string = process.env.GOOGLE_CLIENT_SECRET as string;
    static readonly AuthSecret: string = process.env.AUTH_SECRET as string;
    static readonly WsServer: string = process.env.NEXT_PUBLIC_WS_SERVER as string;
    static readonly WsWhiteboardPlaybackServer: string = process.env.NEXT_PUBLIC_WS_WHITEBOARD__PLAYBACK_SERVER as string;
}


// export const NEXTAUTH_SCERET = process.env.NEXTAUTH_SECRET as string;
