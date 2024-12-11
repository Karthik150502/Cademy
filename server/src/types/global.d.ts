import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
declare module "express" {
    interface Request {
        room_name?: string,
        identity?: string,
        user?: {
            name: string,
            email: string,
            id: string,
            image?: string
        }; // Custom property for user ID
    }
}


declare module 'jsonwebtoken' {
    interface JwtPayload {
        id: string,
        email: string,
        name: string,
        image: string,
    }
}

