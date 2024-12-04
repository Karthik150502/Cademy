import { Request, Response, Router } from "express";
import RoomsRouter from "./room";
import AuthRouter from "./auth";

const app = Router();
app.use("/room", RoomsRouter);
app.use("/auth", AuthRouter);

export default app;

