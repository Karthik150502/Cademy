import { Request, Response, Router } from "express";
import RoomsRouter from "./room";
import AuthRouter from "./auth";
import RecordingsRouter from "./recordings";

const app = Router();
app.use("/room", RoomsRouter);
app.use("/auth", AuthRouter);
app.use("/recordings", RecordingsRouter);

export default app;

