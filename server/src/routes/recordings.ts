import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../lib/prisma";
const app = Router();


app.get("/getall", authMiddleware, async (req: Request, res: Response) => {


    // const roomIdData = await prisma.roomMember.findMany({
    //     where: {
    //         userId: req.user?.id!
    //     },
    //     select: {
    //         room: {
    //             select: {
    //                 id: true
    //             }
    //         }
    //     }
    // })
    // const roomIds = roomIdData.map(item => item.room.id);
    // const recordings = await prisma.meetingRecording.findMany({
    //     where: {
    //         roomId: {
    //             in: roomIds
    //         }
    //     },
    //     select: {
    //         id: true,
    //         // initialState: true,
    //         // subsequentStates: true,
    //         createdAt: true,
    //     },
    // });



    const recordings = await prisma.meetingRecording.findMany({
        where: {
            room: {
                RoomMember: {
                    some: {
                        userId: req.user?.id!,
                    },
                },
            },
        },
        select: {
            id: true,
            // initialState: true,
            // subsequentStates: true,
            createdAt: true,
            room: {
                select: {
                    title: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    },
                    createdAt: true
                }
            }
        },
    });

    res.json({
        status: 200,
        message: "Fetched all the meeting recordings",
        recordings
    })

})


app.get("/:recordingId", authMiddleware, async (req: Request, res: Response) => {
    const { recordingId } = req.params;
    const result = await prisma.meetingRecording.findUnique({
        where: {
            id: recordingId
        },
        select: {
            createdAt: true,
            room: {
                select: {
                    createdAt: true,
                    title: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }
        }
    })

    res.json({
        status: 200,
        data: result
    })

})

export default app;