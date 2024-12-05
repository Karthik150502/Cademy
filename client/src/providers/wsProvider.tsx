'use client'


import React, { useContext, useEffect, useState } from 'react'

type WsProps = {
    socket: WebSocket | null
}

export const WsContext = React.createContext<WsProps | null>(null);

export default function WsProvider({ children }: { children: React.ReactNode }) {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const state = new WebSocket("http://localhost:8001");
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