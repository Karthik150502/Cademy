'use server'
import { cookies } from "next/headers";
import { Api } from "@/lib/api";
import { CreateRoomSchemaType } from "@/schema/createRoomSchema";
import axios from "axios";
export async function create_Stream_and_Room({
    name,
    title
}: CreateRoomSchemaType) {
    const access_token = cookies().get("access_token")?.value;
    const res = await axios.post(`${Api.BACKEND_URL}/api/v1/livekit/create_stream`, {
        title,
        metadata: {
            creator_identity: name,
            enable_chat: false,
            allow_participation: false,
        },
    },
        {
            headers: { "Content-Type": "application/json", "authorization": `Bearer ${access_token}` }
        });
    const {
        auth_token,
        connection_details: { token },
    } = res.data.response;
    return {
        auth_token, token, roomId: res.data.roomId
    }
} 