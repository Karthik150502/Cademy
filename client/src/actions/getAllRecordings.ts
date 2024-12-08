'use server'
import { Api } from "@/lib/api";
import axios from "axios";
import { cookies } from "next/headers";

export async function getRecordings() {
    const token = cookies().get("access_token")?.value;
    const res = await axios.get(`${Api.BACKEND_URL}/api/v1/recordings/getall`, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
    return res.data
}