import RecoilProvider from '@/providers/recoilProvider';
import WsProvider from '@/providers/wsProvider';
import { Theme, ThemePanel } from "@radix-ui/themes";
import React, { ReactNode } from 'react'

export default function StreamLayout({ children }: {
    children: ReactNode
}) {
    return (
        <main className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>
            <RecoilProvider>
                <WsProvider>
                    <Theme
                        appearance="light"
                        accentColor="sky"
                        grayColor="slate"
                        radius="medium"
                    >
                        {children}
                        <ThemePanel defaultOpen={false} />
                    </Theme>
                </WsProvider>
            </RecoilProvider>
        </main>

    )
}
