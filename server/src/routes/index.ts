import { Request, Response, Router } from "express";
import RoomsRouter from "./room";
import AuthRouter from "./auth";
import RecordingsRouter from "./recordings";
import LivekitRouter from "./livekit";

const app = Router();
app.use("/room", RoomsRouter);
app.use("/auth", AuthRouter);
app.use("/recordings", RecordingsRouter);
app.use("/livekit", LivekitRouter);
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Cademy API healthy.",
        status: 200
    })
})

export default app;

