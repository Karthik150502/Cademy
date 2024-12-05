import ProgressSlider from '@/components/app/slider'
import React from 'react'

export default function WhiteboardPage() {



    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>
            <p>Whiteboard</p>
            <div className='w-96'>
                <ProgressSlider timeStamps={[]} />
            </div>
        </div>
    )
}
