'use server'
import { Api } from "@/lib/api";
import axios from "axios";
import { cookies } from "next/headers";

export async function getSingleRecordingDetail(recordingId: string | null) {
    const token = cookies().get("access_token")?.value;
    const { data } = await axios.get(`${Api.BACKEND_URL}/api/v1/recordings/${recordingId}`, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    return data.data
}