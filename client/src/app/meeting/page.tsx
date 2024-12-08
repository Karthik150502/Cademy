'use client'
import React, { useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSingleMeetingDetail } from '@/actions/getSingleMeeting';
import { Loader, UserCircleIcon, AlertTriangleIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWS } from '@/providers/wsProvider';
import { useSetRecoilState } from 'recoil';
import { WhiteBoarsInitialState } from '@/store/recoil';
import moment from 'moment';
import Image from 'next/image';
import { IncomingEvents, OutgoingEvents } from '@/types/whiteboard';

// type SingleMeetingType = {
//     organiser: string,
//     createdAt: Date,
//     RoomMember: {
//         user: {
//             email: string,
//             name: string,
//             image: string,
//         }
//     }[]
// };

export default function MeetingsStartPage() {


    const router = useRouter();
    const { data: session } = useSession();
    const setWhiteBoard = useSetRecoilState(WhiteBoarsInitialState);
    const ws = useWS();
    const meetingId = useSearchParams().get("meetingId");
    const { data, isPending } = useQuery({
        queryKey: [`meeting-${meetingId}`],
        queryFn: async () => {
            return await getSingleMeetingDetail({
                meetingId: meetingId
            })
        }
    })

    const handleMeetingJoin = useCallback(() => {
        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: OutgoingEvents.JOIN_MEETING,
                data: {
                    userId: session?.user?.id,
                    meetingId: meetingId
                }
            }));
        }
        return
    }, [ws, meetingId, session?.user?.id]);

    useEffect(() => {
        if (ws && ws.socket) {
            ws.socket.onopen = () => {
                handleMeetingJoin();
            }
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case IncomingEvents.USER_JOINED: {
                        setWhiteBoard(parsed.strokes);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }
    }, [ws, ws?.socket, handleMeetingJoin, setWhiteBoard])





    return (
        <div className='min-h-screen overflow-hidden relative flex items-center flex-col justify-center gap-y-2'>
            {
                isPending ? <div className='flex flex-col items-center justify-center gap-2'>
                    <Loader className='animate-spin' />
                    <p>Loading Meeting Details</p>
                </div> : data.room ? <div className='flex w-full flex-col gap-y-3 items-center justify-center'>
                    <p className='text-md'>
                        Subject - <span className='text-lg font-semibold'>{data.room.title}</span>
                    </p>
                    <div className='w-full text-xs flex flex-col items-start justify-center'>
                        <div className='w-full flex items-center justify-between'>
                            <div className='flex flex-col items-start justify-center'>
                                <p>Hosted by <span className='font-bold'>{data.room.user.name}</span></p>
                                <p>UserId <span className='font-bold'>{data.room.user.email}</span></p>
                            </div>
                            {data.room.user.image ? <Image src={data.room.user.image} height={25} width={25} alt={data.room.user.name || ""} className={"rounded-full h-[35px] w-[35px]"} /> : <UserCircleIcon size={38} strokeWidth={1} />
                            }
                        </div>
                        <p>Started {moment(data.room.createdAt).fromNow()}</p>
                    </div>
                    <div className='w-full flex items-start'>
                        <p className='text-xs'>All Attendees</p>
                    </div>

                    <div className='flex w-full flex-col items-start justify-start gap-y-2 h-[275px] overflow-auto no-scrollbar shadow-inner border border-black/15 rounded-xl px-4 py-2'>
                        {
                            data.room.RoomMember.map(({ user }: {
                                user: {
                                    email: string,
                                    name: string,
                                    image: string,
                                }
                            }) => {
                                return <div key={user.email} className='w-full flex items-center justify-start rounded-lg shadow-xl px-4 py-2 gap-x-2'>
                                    {
                                        user.image ? <Image src={user.image} height={15} width={15} alt={user.name || ""} className={"rounded-full h-[25px] w-[25px]"} /> : <UserCircleIcon size={28} strokeWidth={1} />
                                    }
                                    <p className='text-xs'>{user.name} | {user.email}</p>
                                </div>
                            })
                        }
                    </div>
                </div> : <div className='flex flex-col items-center justify-center gap-2'>
                    <AlertTriangleIcon className='' />
                    <p>Error loading data</p>
                </div>
            }
            {(!isPending && data.room) && <div className='flex items-center justify-center gap-x-2'>
                <Button variant={"outline"} size={"icon"} onClick={() => {
                    router.push(`/dashboard`)
                }}>
                    <HomeIcon />
                </Button><Button
                    onClick={() => {
                        router.push(`/meeting/${meetingId}`);
                    }}
                >Join Meeting</Button>
            </div>}

        </div>
    )
}
