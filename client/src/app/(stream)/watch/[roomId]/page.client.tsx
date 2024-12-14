"use client";
import { StreamPlayer } from "@/components/livekit/stream_player";
import { TokenContext } from "@/components/livekit/token_context";
import { JoinStreamResponse } from "@/types/livekit/index";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { Loader as Spinner, ChevronRight as ArrowRightIcon, User as PersonIcon } from "lucide-react";
import {
    Avatar,
    Box,
    Card,
    Flex,
    Heading,
    Text,
    TextField,
} from "@radix-ui/themes";
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { joinStream } from "@/actions/livekit/join_stream";
import { useSession } from "next-auth/react";
import Whiteboard from "@/components/app/whiteBoard";
export default function WatchPage({
    roomId,
    serverUrl,
}: {
    roomId: string;
    serverUrl: string;
}) {
    const [name, setName] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [roomToken, setRoomToken] = useState("");
    const { data: session } = useSession();

    const { isPending, mutate } = useMutation({
        mutationFn: async () => {
            return await joinStream({
                name: name,
                roomId: roomId
            })
        },
        mutationKey: [`${roomId}-${session?.user?.id}`],
        onSuccess: (data) => {
            const {
                auth_token,
                connection_details: { token },
            } = (data as JoinStreamResponse);

            setAuthToken(auth_token);
            setRoomToken(token);
        }
    })

    if (!authToken || !roomToken) {
        return (
            <Flex align="center" justify="center" className="min-h-screen">
                <Card className="p-3 w-[380px]">
                    <Heading size="4" className="mb-4">
                        Entering {decodeURI(roomId)}
                    </Heading>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Your name
                        </Text>
                        <TextField.Root>
                            <TextField.Slot>
                                <Avatar
                                    size="1"
                                    radius="full"
                                    fallback={name ? name[0] : <PersonIcon />}
                                />
                            </TextField.Slot>
                            <TextField.Input
                                placeholder="Roger Dunn"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </TextField.Root>
                    </label>
                    <Flex gap="3" mt="6" justify="end">
                        <Button disabled={!name || isPending} onClick={() => { mutate() }}>
                            {isPending ? (
                                <Flex gap="2" align="center">
                                    <Spinner />
                                    <Text>Joining...</Text>
                                </Flex>
                            ) : (
                                <>
                                    Join as viewer{" "}
                                    <ArrowRightIcon className={cn(name && "animate-wiggle")} />
                                </>
                            )}
                        </Button>
                    </Flex>
                </Card>
            </Flex>
        );
    }

    return (
        <div className="min-h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center">
            <div className="absolute z-50 top-[55px] right-0">
                <TokenContext.Provider value={authToken}>
                    <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
                        <Box className="flex-1">
                            <StreamPlayer />
                        </Box>
                    </LiveKitRoom>
                </TokenContext.Provider>
            </div>
            <Whiteboard meetingId={roomId} />
        </div>
    );
}
