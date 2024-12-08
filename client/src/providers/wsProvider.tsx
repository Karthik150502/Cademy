'use client'


import { Env } from '@/lib/config';
import { useSession } from 'next-auth/react';
import React, { useContext, useEffect, useState } from 'react'

type WsProps = {
    socket: WebSocket | null
}

export const WsContext = React.createContext<WsProps | null>(null);

export default function WsProvider({ children }: { children: React.ReactNode }) {


    const { data } = useSession();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const state = new WebSocket(`${Env.WsServer}?userId=${data?.user?.id}`);
        setSocket(state);
        return () => {
            state.close();
            setSocket(null);
        }
    }, [])

    return (
        <WsContext.Provider value={{ socket }}>
            {children}
        </WsContext.Provider>
    )
}



export function useWS() {
    const state = useContext(WsContext);
    const [ws, setWs] = useState<WsProps | null>(null);

    useEffect(() => {
        if (state) {
            setWs(state)
        }
    }, [state])

    return ws;
}