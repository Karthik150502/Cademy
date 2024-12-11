'use server'

import { Api } from "@/lib/api";
import { CreateRoomSchemaType } from "@/schema/createRoomSchema";
import axios from "axios";
export async function create_Stream_and_Room({
    name,
    title
}: CreateRoomSchemaType) {
    const res = await axios.post(`${Api.BACKEND_URL}/api/v1/livekit/create_stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            room_name: title,
            metadata: {
                creator_identity: name,
                enable_chat: false,
                allow_participation: false,
            },
        }),
    });
    const {
        auth_token,
        connection_details: { token },
    } = res.data.response;
    return {
        auth_token, token, roomId: res.data.roomId
    }
} 