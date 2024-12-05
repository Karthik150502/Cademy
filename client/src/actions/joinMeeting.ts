'use server'
import { cookies } from "next/headers";
import axios from "axios";
import { JoinRoomSchemaType } from "@/schema/joinRoomSchema";
import { Api } from "@/lib/api";
export async function joinRoom({
    roomId
}: JoinRoomSchemaType) {
    const token = cookies().get("access_token")?.value;

    const res = await axios.post(`${Api.BACKEND_URL}/api/v1/room/join`, {
        roomId
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.data;

}