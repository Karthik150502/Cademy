import React from 'react'
import AllRooms from '@/components/app/allRooms';
export default async function DashboardPage() {

    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>
            <AllRooms />
        </div>
    )
}
