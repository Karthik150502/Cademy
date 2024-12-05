'use client'

import React from 'react'
import LandingText from './textAnimation'

export default function Logo({ size = 30 }: { size: number }) {
    return (
        <div className='tracking-tighter'>
            <LandingText size={size}>
                Cademy
            </LandingText>
        </div>
    )
}
