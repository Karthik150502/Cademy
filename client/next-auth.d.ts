import { JwtPayload } from "jsonwebtoken";
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
    interface JWT {
        user?: {
            name: string,
            email: string,
            id: string,
            image?: string
        }; // Custom property for user ID
    }
}
declare module 'jose' {
    interface JWTPayload {
        id: string,
        email: string,
        name: string,
        image: string,
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

