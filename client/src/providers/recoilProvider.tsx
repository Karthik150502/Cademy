'use client'
import { RecoilRoot } from "recoil"

import React from 'react'

export default function RecoilProvider({ children }: {
    children: React.ReactNode
}) {
    return (
        <RecoilRoot>{children}</RecoilRoot>
    )
}
