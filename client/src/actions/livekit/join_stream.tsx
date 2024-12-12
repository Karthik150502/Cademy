'use server'
import { cookies } from "next/headers";
import { Api } from "@/lib/api";
import axios from "axios";
export async function joinStream({
    name,
    roomId
}: {
    name: string,
    roomId: string
}) {
    const access_token = cookies().get("access_token")?.value;
    const res = await axios.post(`${Api.BACKEND_URL}/api/v1/livekit/join_stream`, {
        roomId: roomId,
        identity: name,
    },
        {
            headers: { "Content-Type": "application/json", "authorization": `Bearer ${access_token}` }
        });
    const {
        auth_token,
        connection_details: { token },
    } = res.data.response;
    return {
        auth_token,
        connection_details: { token },
    }
} 