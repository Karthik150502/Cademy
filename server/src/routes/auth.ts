import { Request, Response, Router } from "express";
import { decode, JwtPayload } from "jsonwebtoken";
const app = Router();


app.post("/refresh", async (req: Request, res: Response) => {
    let { token } = req.body;
    let payload = decode(token) as JwtPayload;

    res.json({
        status: 200,
        accessToken: payload
    })

})


export default app;