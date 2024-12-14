'use client'
import { Room, User } from '@prisma/client'
import { AlertTriangleIcon, HomeIcon, Loader, UserCircleIcon } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MeetingDetails({
  isPending,
  room,
  isHosting,
  at,
  rt
}: {
  isPending: boolean,
  isHosting: boolean,
  at?: string,
  rt?: string,
  room: Room & {
    RoomMember: {
      user: User
    }[],
    user: User
  }
}) {

  const router = useRouter();
  return (
    <div className='flex flex-col gap-2 items-center justify-center p-4 rounded-lg border border-black/15 shadow-lg'>
      {
        isPending ? <div className='flex flex-col items-center justify-center gap-2'>
          <Loader className='animate-spin' />
          <p>Loading Meeting Details</p>
        </div> : room ? <div className='flex w-full flex-col gap-y-3 items-center justify-center'>
          <p className='text-md'>
            Subject - <span className='text-lg font-semibold'>{room.title}</span>
          </p>
          <div className='w-full text-xs flex flex-col items-start justify-center'>
            <div className='w-full flex items-center justify-between'>
              <div className='flex flex-col items-start justify-center'>
                <p>Hosted by <span className='font-bold'>{room.user.name}</span></p>
                <p>UserId <span className='font-bold'>{room.user.email}</span></p>
              </div>
              {room.user.image ? <Image src={room.user.image} height={25} width={25} alt={room.user.name || ""} className={"rounded-full h-[35px] w-[35px]"} /> : <UserCircleIcon size={38} strokeWidth={1} />
              }
            </div>
            <p>Started {moment(room.createdAt).fromNow()}</p>
          </div>
          <div className='w-full flex items-start'>
            <p className='text-xs'>All Attendees</p>
          </div>

          <div className='flex w-full flex-col items-start justify-start gap-y-2 h-[275px] overflow-auto no-scrollbar shadow-inner border border-black/15 rounded-xl px-4 py-2'>
            {
              room.RoomMember.map(({ user }: {
                user: User
              }) => {
                return <div key={user.email} className='w-full flex items-center justify-start rounded-lg shadow-xl px-4 py-2 gap-x-2'>
                  {
                    user.image ? <Image src={user.image} height={15} width={15} alt={user.name || ""} className={"rounded-full h-[25px] w-[25px]"} /> : <UserCircleIcon size={28} strokeWidth={1} />
                  }
                  <p className='text-xs'>{user.name} | {user.email}</p>
                </div>
              })
            }
          </div>
        </div> : <div className='flex flex-col items-center justify-center gap-2'>
          <AlertTriangleIcon className='' />
          <p>Error loading data</p>
        </div>
      }
      {(!isPending && room) && <div className='flex items-center justify-center gap-x-2'>
        <Button variant={"outline"} size={"icon"} onClick={() => {
          router.push(`/dashboard`)
        }}>
          <HomeIcon />
        </Button>
        <Button>
          <Link href={isHosting ? `/host?&at=${at}&rt=${rt}&roomId=${room.id}` : `/watch/${room.id}`}>
            Join Meeting
          </Link></Button>
      </div>}
    </ div >
  )
}
