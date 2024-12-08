'use client'

import React from 'react'
import LandingText from './textAnimation'
import { useRouter } from 'next/navigation';

export default function Logo({ size = 30 }: { size?: number }) {
    const router = useRouter();
    return (
        <div className='tracking-tighter cursor-pointer' onClick={() => {
            router.push("/dashboard")
        }} >
            <LandingText size={size}>
                Cademy
            </LandingText>
        </div>
    )
}
