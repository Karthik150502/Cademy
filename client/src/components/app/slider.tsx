'use client'


import React, { useEffect, useState } from 'react'


type Props = {
    timeStamps: number[]
}

export default function ProgressSlider({ timeStamps }: Props) {


    const [duration, setDuration] = useState<number>(0);
    const [isSeeking, setIsSeeking] = useState<boolean>(false);


    useEffect(() => {
        const timeS = window.localStorage.getItem("timeStamps");
        if (!timeS) {
            return
        }
        const timeStamps = JSON.parse(timeS);
        if (!timeStamps) {
            return
        }
        const state = timeStamps[timeStamps.length - 1] - timeStamps[0];
        setDuration(state);
        console.log(duration);
    }, [duration])

    return (
        <div className='w-full h-[10px] bg-black rounded-full relative'>
            <div className='w-[10px] h-[10px] absolute rounded-full bg-white border border-black cursor-pointer'
                style={{
                    left: "50%"
                }}
                onMouseDown={() => { setIsSeeking(true) }}
                onMouseUp={() => { setIsSeeking(false) }}
            ></div>
        </div>
    )
}
