'use client'
import React, { useState } from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import Logo from '../ui/brand';
import { signOut } from 'next-auth/react';
import JoinRoomDialog from './joinRoomDialog';
import CreateRoomDialog from './createRoomDialog';
import Link from 'next/link';


export default function MobileNav() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle asChild>
                        <Logo />
                    </SheetTitle>
                    <SheetDescription className='flex flex-col items-center justify-center gap-y-4 py-4 border-t border-t-black/15'>
                        <SheetClose asChild>
                            <Link href={"/dashboard"} className='cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'>
                                Dashboard
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <JoinRoomDialog />
                        </SheetClose>
                        <SheetClose asChild>
                            <CreateRoomDialog />
                        </SheetClose>
                        <SheetClose asChild>
                            <p className='cursor-pointer  text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'
                                onClick={() => {
                                    signOut();
                                }}
                            >
                                Log Out
                            </p>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href={"/dashboard/recordings"} className='cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'>
                                Recordings
                            </Link>
                        </SheetClose>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>

    )
}
