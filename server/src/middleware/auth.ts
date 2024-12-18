import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { AUTH_SECRET } from "../lib/config";


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {

    let tokenString = req.headers["authorization"];
    console.log(tokenString)
    if (!tokenString) {
        res.json({
            status: 403,
            message: "Unauthorized"
        });
        return;
    }

    let token = tokenString.split(" ")[1];
    let payload;
    try {
        payload = verify(token, AUTH_SECRET) as JwtPayload;
        console.log("Payload = ", payload);
    } catch {
        console.log("catch block")
        res.json({
            status: 403,
            message: "Unauthorized"
        });
        return;
    }
    if (!payload) {
        res.json({
            status: 403,
            message: "Unauthorized"
        });
        return;
    }
    req.user = payload;
    next();
}       