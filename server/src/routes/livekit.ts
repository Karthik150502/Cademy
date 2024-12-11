import { Request, Response, Router } from "express";
import { livekitApiKey, livekitApiSecret, liveKitWsUrl } from "../lib/config";
import { Controller, CreateStreamParams, getSessionFromReq, InviteToStageParams, JoinStreamParams, RemoveFromStageParams } from "../controllers";
import { AccessToken } from "livekit-server-sdk";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
const app = Router();

app.get("/token", async (req: Request, res: Response) => {

    let { room, username } = req.query;

    if (!livekitApiKey || !livekitApiSecret || !liveKitWsUrl) {
        res.json({ status: 500, message: 'Server misconfigured' });
        return;
    }

    if (!room || !username) {
        res.json({
            status: 400,
            message: "Username or room id missing."
        })
        return
    }

    const at = new AccessToken(livekitApiKey, livekitApiSecret, { identity: username as string });
    at.addGrant({ room: room as string, roomJoin: true, canPublish: true, canSubscribe: true });

    res.json({
        status: 200,
        token: at.toJwt()
    })
    return

})


app.post("/create_stream", authMiddleware, async (req: Request, res: Response) => {
    const controller = new Controller();
    try {
        const reqBody = await req.body;
        const response = await controller.createStream(
            reqBody as CreateStreamParams
        );
        const room = await prisma.room.create({
            data: {
                organiser: req.user?.id!,
                title: (reqBody as CreateStreamParams).room_name,
                RoomMember: {
                    create: {
                        userId: req.user?.id!,
                    }
                }

            }
        })

        res.json({
            status: 200,
            roomId: room.id,
            response,
        });
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }

        res.json({ status: 500 });
        return
    }
})

app.post("/invite_to_stage", async (req: Request, res: Response) => {
    const controller = new Controller();
    try {
        let tokenString = req.headers.authorization;
        let token = tokenString?.split(" ")[1];
        const session = getSessionFromReq(token);
        const reqBody = await req.body;
        await controller.inviteToStage(session, reqBody as InviteToStageParams);

        res.json({});
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }

        res.json({ status: 500 });
        return
    }
})


app.post("/join_stream", async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        const reqBody = await req.body;
        const roomId = reqBody.roomId;

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
            const response = await controller.joinStream(reqBody as JoinStreamParams);
            res.json({
                status: 200,
                roomId: room.id,
                response
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
        const response = await controller.joinStream(reqBody as JoinStreamParams);
        res.json({
            status: 200,
            message: "Room joined successfully.",
            roomId: roomMember.room.id,
            response
        })
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }
        res.json({ status: 500 });
        return
    }
})

app.post("/raise_hand", async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        let tokenString = req.headers.authorization;
        let token = tokenString?.split(" ")[1];
        const session = getSessionFromReq(token);
        await controller.raiseHand(session);
        res.json({});
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }

        res.json({ status: 500 });
        return
    }

})


app.post("/remove_from_stage", async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        const tokenString = req.headers.authorization;
        const token = tokenString?.split(" ")[1];
        const session = getSessionFromReq(token);
        const reqBody = await req.body;
        await controller.removeFromStage(session, reqBody as RemoveFromStageParams);

        res.json({});
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }

        res.json({ status: 500 });
        return
    }
})


app.post("/stop_stream", async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        const tokenString = req.headers.authorization;
        const token = tokenString?.split(" ")[1];
        const session = getSessionFromReq(token);
        await controller.stopStream(session);

        res.json({});
        return
    } catch (err) {
        if (err instanceof Error) {
            res.json({ error: err.message, status: 500 });
            return
        }

        res.json({ status: 500 });
        return
    }
})

export default app;
