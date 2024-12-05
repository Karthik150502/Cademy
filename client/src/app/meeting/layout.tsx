import RecoilProvider from '@/providers/recoilProvider'
import WsProvider from '@/providers/wsProvider'
import React from 'react'
export default function MeetingsLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <main className='min-h-screen overflow-hidden relative flex flex-col items-center'>
            <RecoilProvider>
                <WsProvider>
                    {children}
                </WsProvider>
            </RecoilProvider>
        </main>
    )
}
