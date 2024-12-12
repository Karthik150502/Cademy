'use client'
import { useCopyToClipboard } from "@/lib/clipboard";
import { ParticipantMetadata, RoomMetadata } from "@/types/livekit/index";
import {
    AudioTrack,
    StartAudio,
    VideoTrack,
    useLocalParticipant,
    useMediaDeviceSelect,
    useParticipants,
    useRoomContext,
    useTracks,
} from "@livekit/components-react";
import { Copy as CopyIcon, Eye as EyeClosedIcon, EyeOff as EyeOpenIcon } from "lucide-react";
import { Avatar, Badge, Button, Flex, Grid } from "@radix-ui/themes";
import {
    ConnectionState,
    LocalVideoTrack,
    Track,
    createLocalTracks,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { Env } from "@/lib/config";
import { useMutation } from "@tanstack/react-query";
import { leaveStage } from "@/actions/livekit/leave_stage";



export function StreamPlayer({ isHost = false }) {
    const [_, copy] = useCopyToClipboard();
    const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();
    const localVideoEl = useRef<HTMLVideoElement>(null);
    const { metadata, name: roomName, state: roomState } = useRoomContext();
    const roomMetadata = (metadata && JSON.parse(metadata)) as RoomMetadata;
    const { localParticipant } = useLocalParticipant();
    const localMetadata = (localParticipant.metadata &&
        JSON.parse(localParticipant.metadata)) as ParticipantMetadata;
    const canHost =
        isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);
    const participants = useParticipants();
    const showNotification = isHost
        ? participants.some((p) => {
            const metadata = (p.metadata &&
                JSON.parse(p.metadata)) as ParticipantMetadata;
            return metadata?.hand_raised && !metadata?.invited_to_stage;
        })
        : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;
    useEffect(() => {
        if (canHost) {
            const createTracks = async () => {
                const tracks = await createLocalTracks({ audio: true, video: true });
                const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
                if (camTrack && localVideoEl?.current) {
                    camTrack.attach(localVideoEl.current);
                }
                setLocalVideoTrack(camTrack as LocalVideoTrack);
            };
            void createTracks();
        }
    }, [canHost]);

    const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
        kind: "videoinput",
    });

    useEffect(() => {
        if (localVideoTrack) {
            void localVideoTrack.setDeviceId(activeCameraDeviceId);
        }
    }, [localVideoTrack, activeCameraDeviceId]);

    const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
        (t) => t.participant.identity !== localParticipant.identity
    );

    const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
        (t) => t.participant.identity !== localParticipant.identity
    );

    const leaveStageMutation = useMutation({
        mutationFn: async () => await leaveStage({
            identity: localParticipant.identity
        })
    })

    return (
        <div className="relative h-[300px] w-[350px] bg-black border border-white/25">
            <Grid className="w-full h-full absolute" gap="2">
                {canHost && (
                    <div className="relative">
                        <Flex
                            className="absolute w-full h-full"
                            align="center"
                            justify="center"
                        >
                            <Avatar
                                size="9"
                                fallback={localParticipant.identity[0] ?? "?"}
                                radius="full"
                            />
                        </Flex>
                        <video
                            height={350}
                            width={350}
                            ref={localVideoEl}
                            className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
                        />
                        <div className="absolute w-full h-full">
                            <Badge
                                variant="outline"
                                color="gray"
                                className="absolute bottom-2 right-2"
                            >
                                {localParticipant.identity} (you)
                            </Badge>
                        </div>
                    </div>
                )}
                {remoteVideoTracks.map((t) => (
                    <div key={t.participant.identity} className="relative">
                        <Flex
                            className="absolute w-full h-full"
                            align="center"
                            justify="center"
                        >
                            <Avatar
                                size="9"
                                fallback={t.participant.identity[0] ?? "?"}
                                radius="full"
                            />
                        </Flex>
                        <VideoTrack
                            trackRef={t}
                            className="absolute w-full h-full bg-transparent"
                        />
                        <div className="absolute w-full h-full">
                            <Badge
                                variant="outline"
                                color="gray"
                                className="absolute bottom-2 right-2"
                            >
                                {t.participant.identity}
                            </Badge>
                        </div>
                    </div>
                ))}
            </Grid>

            {remoteAudioTracks.map((t) => (
                <AudioTrack trackRef={t} key={t.participant.identity} />
            ))}
            <StartAudio
                label="Click to allow audio playback"
                className="absolute top-0 h-full w-full bg-gray-2-translucent text-white"
            />

            <div className="absolute h-full flex flex-col items-center justify-between top-0 w-full p-2">
                <Flex justify="between" align="end">
                    <Flex gap="2" justify="center" align="center">
                        <Button
                            size="1"
                            variant="soft"
                            disabled={!Boolean(roomName)}
                            onClick={() =>
                                copy(`${Env.siteUrl}/watch/${roomName}`)
                            }
                        >
                            {roomState === ConnectionState.Connected ? (
                                <>
                                    {roomName} <CopyIcon />
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </Button>
                    </Flex>
                    <Flex gap="2">
                        {roomState === ConnectionState.Connected && (
                            <Flex gap="1" align="center">
                                <div className="rounded-6 bg-red-9 w-2 h-2 animate-pulse" />
                                <Button disabled>
                                    Live
                                </Button>
                            </Flex>
                        )}
                        <PresenceDialog isHost={isHost}>
                            <div className="relative">
                                {showNotification && (
                                    <div className="absolute flex h-3 w-3 -top-1 -right-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-6 bg-accent-11 opacity-75"></span>
                                        <span className="relative inline-flex rounded-6 h-3 w-3 bg-accent-11"></span>
                                    </div>
                                )}
                                <Button
                                    size="1"
                                    variant="soft"
                                    disabled={roomState !== ConnectionState.Connected}
                                >
                                    {roomState === ConnectionState.Connected ? (
                                        <EyeOpenIcon />
                                    ) : (
                                        <EyeClosedIcon />
                                    )}
                                    {roomState === ConnectionState.Connected
                                        ? participants.length
                                        : ""}
                                </Button>
                            </div>
                        </PresenceDialog>
                    </Flex>
                </Flex>
                <div className="flex items-center w-full justify-center gap-x-2">
                    {roomName && canHost && (
                        <Flex gap="2">
                            {roomMetadata?.creator_identity !==
                                localParticipant.identity && (
                                    <Button size="1" onClick={() => { leaveStageMutation.mutate() }}>
                                        Leave stage
                                    </Button>
                                )}
                        </Flex>
                    )}
                    <MediaDeviceSettings />
                </div>
            </div>
        </div>
    );
}
