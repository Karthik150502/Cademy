'use server'
import { cookies } from "next/headers";
import axios from "axios";
import { CreateRoomSchemaType } from "@/schema/createRoomSchema";
import { Api } from "@/lib/api";
export async function createRoom({
    title
}: CreateRoomSchemaType) {
    const token = cookies().get("access_token")?.value;

    const res = await axios.post(`${Api.BACKEND_URL}/api/v1/room`, {
        title
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.data;

}