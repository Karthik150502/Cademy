import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='min-h-screen overflow-hidden relative flex items-center justify-center flex-col'>
            {children}
        </main>
    )
}
