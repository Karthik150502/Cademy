import RecoilProvider from '@/providers/recoilProvider'
import WsWhiteBoard from '@/providers/wsWhiteBoardReplay'
import React from 'react'
export default function MeetingsLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <main className='min-h-screen overflow-hidden relative flex flex-col items-center'>
            <RecoilProvider>
                <WsWhiteBoard>
                    {children}
                </WsWhiteBoard>
            </RecoilProvider>
        </main>
    )
}
