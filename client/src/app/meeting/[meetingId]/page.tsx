'use client'
import Whiteboard from '@/components/app/whiteBoard';
import React from 'react'


type Props = {
    params: {
        meetingId: string
    }
}

export default function MeetingPage({ params }: Props) {
    return (
        <div className='min-h-screen overflow-hidden relative flex items-center flex-col justify-center'>
            <Whiteboard meetingId={params.meetingId} />
        </div>
    )
}
