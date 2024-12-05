"use client"


import { Session } from 'next-auth'
import React from 'react'
import { useSession } from 'next-auth/react'
export default function ExampleSessionDisplay({ session }: { session: Session | null }) {

    let { data } = useSession();

    return (
        <div className="text-black">
            <p className='text-black'>
                {session ? "Session data from Server side" : data?.user ? "Session data from Client side" : "Session not found"}
            </p>
            <pre>{JSON.stringify(session ?? data, null, 4)}</pre>
        </div>
    )
}
