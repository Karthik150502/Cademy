"use client"
import React from 'react'
import { Button } from '../ui/button'
import { signOutUser } from '@/actions/signOut'
export default function SignOutButton() {
    const handleSignOut = async () => {
        await signOutUser();
    }
    return (
        <Button
            onClick={handleSignOut}
        >
            Sign Out
        </Button>
    )
}
