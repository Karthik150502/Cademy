"use server"
import { Api } from "@/lib/api";
import axios from "axios"

export async function refreshAccess() {
    // let token = cookies().get("access_token")?.value;
    // if (!token) {
    //     return;
    // }
    const token = ""
    const searhParams = new URLSearchParams({ token });
    await axios.get(`${Api.APP_SERVER}/api/refresh-access?${searhParams}`);
}