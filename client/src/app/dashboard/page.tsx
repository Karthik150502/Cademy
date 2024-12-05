import React from 'react'
import { auth } from '@/auth'
import SignOutButton from '@/components/app/signOutButton';
import ExampleSessionDisplay from '@/components/app/example';
export default async function DashboardPage() {

    const session = await auth();


    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>
            Dashboard Page
            <ExampleSessionDisplay session={session} />
            <SignOutButton />
        </div>
    )
}
