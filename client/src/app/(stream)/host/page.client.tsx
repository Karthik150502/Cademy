"use client";

import Whiteboard from "@/components/app/whiteBoard";
import { StreamPlayer } from "@/components/livekit/stream_player";
import { TokenContext } from "@/components/livekit/token_context";
import { LiveKitRoom } from "@livekit/components-react";
import { Box } from "@radix-ui/themes";

export default function HostPage({
    authToken,
    roomToken,
    serverUrl,
    roomId
}: {
    authToken: string;
    roomToken: string;
    serverUrl: string;
    roomId: string
}) {
    return (
        <div className="min-h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center">
            <div className="absolute z-50 top-[55px] right-0">
                <TokenContext.Provider value={authToken}>
                    <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
                        <Box className="flex-1">
                            <StreamPlayer isHost />
                        </Box>
                    </LiveKitRoom>
                </TokenContext.Provider>
            </div>
            <Whiteboard meetingId={roomId} isHost />
        </div>
    );
}
