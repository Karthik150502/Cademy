import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../lib/prisma";
const app = Router();

app.get("/", authMiddleware, async (req: Request, res: Response) => {

    const rooms = await prisma.roomMember.findMany({
        where: {
            userId: req.user?.id!
        },
        select: {
            room: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            RoomMember: true, // Count the number of members in the room
                        },
                    },
                },

            }
        }
    });


    res.json({
        status: 200,
        rooms: rooms
    })
    return;
})



app.get("/:meetingId", authMiddleware, async (req: Request, res: Response) => {

    let { meetingId } = req.params;

    const room = await prisma.room.findUnique({
        where: {
            id: meetingId
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                    email: true
                }
            },
            RoomMember: {
                select: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                            image: true
                        }
                    }
                }
            }
        }
    });

    if (!room) {
        res.json({
            status: 404,
            message: "Room not found"
        })
        return;
    }
    res.json({
        status: 200,
        room: room,
        message: "Room fetched."
    })
    return;
})

app.post("/", authMiddleware, async (req: Request, res: Response) => {
    const { title } = req.body;
    const room = await prisma.room.create({
        data: {
            organiser: req.user?.id!,
            title,
            RoomMember: {
                create: {
                    userId: req.user?.id!,
                }
            }

        }
    })

    res.json({
        status: 200,
        message: "Room created successfully.",
        roomId: room.id
    })
})

app.post("/join", authMiddleware, async (req: Request, res: Response) => {

    const { roomId } = req.body;

    const room = await prisma.room.findUnique({
        where: {
            id: roomId
        },
        select: {
            id: true,
            RoomMember: {
                where: {
                    userId: req.user?.id
                }
            }
        }
    })
    console.log(room)
    if (!room) {
        res.json({
            status: 404,
            message: "Room not found",
        })
        return;
    };

    if (room.RoomMember.length > 0) {
        res.json({
            status: 200,
            message: "Already a member.",
            roomId: room.id
        })
        return;
    }

    const roomMember = await prisma.roomMember.create({
        data: {
            userId: req.user?.id!,
            roomId: roomId
        },
        select: {
            room: {
                select: {
                    id: true
                }
            }
        }
    })
    res.json({
        status: 200,
        message: "Room joined successfully.",
        roomId: roomMember.room.id
    })
})

export default app;