'use client'
import React from 'react'
import Logo from '../ui/brand';
import CreateRoomDialog from './createRoomDialog';
import JoinRoomDialog from './joinRoomDialog';
import { signOutUser } from '@/actions/signOut';
import MobileNav from './mobileNav';
import Link from 'next/link';
import { Button } from '../ui/button';
import { HomeIcon } from 'lucide-react';
export default function Header() {
    return (
        <nav className="top-0 fixed w-full h-[55px] flex items-center justify-between md:hidden:border-b border-b-black/15 px-4 z-10">
            <div className='md:hidden'><Logo size={35} /></div>
            <section className='h-[50px] mx-auto hidden rounded-xl shadow-lg md:flex items-center justify-between border border-black/15 w-[70%] px-4'>
                <div>
                    <Logo size={25} />
                </div>
                <Button variant={"outline"} size="icon" className='rounded-full' asChild>
                    <Link href={"/dashboard"}>
                        <HomeIcon strokeWidth={1} />
                    </Link>
                </Button>
                <div className="flex items-center justify-center gap-x-4">
                    <Link href={"/dashboard/recordings"} className='cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'>
                        Recordings
                    </Link>
                    <JoinRoomDialog />
                    <CreateRoomDialog />
                    <p className='cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'
                        onClick={async () => {
                            await signOutUser();
                        }}
                    >
                        Log Out
                    </p>
                </div>
            </section>
            <div className='md:hidden'>
                <MobileNav />
            </div>
        </nav >
    )
}
