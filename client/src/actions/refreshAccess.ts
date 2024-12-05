"use server"
import { Api } from "@/lib/api";
import axios from "axios"
import { cookies } from "next/headers"

export async function refreshAccess() {
    // let token = cookies().get("access_token")?.value;
    // if (!token) {
    //     return;
    // }
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtNDZ6bjlyazAwMDB1aG44ODN3Z3JibWUiLCJuYW1lIjoiS2FydGhpayBKIiwiZW1haWwiOiJrYXJ0aGlrcmR5MTUwNTAyQGdtYWlsLmNvbSIsImltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTGZMR0JYZkh1aWFPcHlNSC1GOWZfaWZMMlhMeFBBdWpHRFhnalZBMmdwakdoRFRDZz1zOTYtYyIsImlhdCI6MTczMzIzMzk1NiwiZXhwIjoxNzMzMjQxMTU2fQ.joL55z2nfsALrnhee4RINq8rvHiiXdSsk9ZVTQYMkdE"
    let searhParams = new URLSearchParams({ token });
    await axios.get(`${Api.APP_SERVER}/api/refresh-access?${searhParams}`);
}