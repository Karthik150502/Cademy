'use client'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function NotFoundPage() {
    const router = useRouter();
    return (
        <div className='min-h-screen relative overflow-hidden flex items-center justify-center '>
            <div className='flex flex-col items-center justify-center gap-y-4'>
                <p className='text-2xl'>404, page not found</p>
                <p className='text-sm text-muted-foreground'>The page you are looking cannot be found in this app.</p>
                <Button variant={"outline"}
                    onClick={() => {
                        router.push("/dashboard")
                    }}
                >
                    <HomeIcon />Go back to Dashboard
                </Button>
            </div>
        </div>
    )
}
