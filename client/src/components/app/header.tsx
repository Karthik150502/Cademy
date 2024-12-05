'use client'


import React from 'react'
import Logo from '../ui/brand';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import CreateRoomDialog from './createRoomDialog';
import JoinRoomDialog from './joinRoomDialog';
import { signOut } from 'next-auth/react';
export default function Header() {
    return (
        <nav className="top-0 fixed w-full h-[55px] flex items-center justify-between md:hidden:border-b border-b-black/15 px-4">
            <div className='md:hidden'><Logo size={35} /></div>
            <section className='h-[50px] mx-auto hidden rounded-xl shadow-lg md:flex items-center justify-between border border-black/15 w-[60%] px-4'>
                <div>
                    <Logo size={25} />
                </div>
                <div className="flex items-center justify-center gap-x-4">
                    <JoinRoomDialog />
                    <CreateRoomDialog />
                    <p className='cursor-pointer  text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'
                        onClick={() => {
                            signOut();
                        }}
                    >
                        Log Out
                    </p>
                </div>
            </section>
            <div className='md:hidden'>
                <Button variant={"outline"} size={"icon"}>
                    <Menu />
                </Button>
            </div>
        </nav >
    )
}
