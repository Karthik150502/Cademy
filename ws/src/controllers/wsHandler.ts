import { User } from "./user";
import { MeetingManager } from "./meetingManager";
import WebSocket from "ws";
export class WsHandler {
    constructor(private user: User, private ws: WebSocket) {
        this.user = user;
        this.ws = ws;
    }
    public broadcast(meetingId: string, jsonString: string) {
        let meetingInfo = MeetingManager.getMeeting(meetingId)!
        if (!meetingInfo) {
            return;
        }
        const userId = this.user.getUserId();
        Object.entries(meetingInfo.members).forEach(([peerId, peer]: [string, User]) => {
            console.log("userid, Id", userId, peerId)
            if (userId !== peerId) {
                peer.sendMessage(jsonString)
            }
        })
    }
    public emitToAll(meetingId: string, jsonString: string) {
        let meetingInfo = MeetingManager.getMeeting(meetingId)!
        if (!meetingInfo) {
            return;
        }

        Object.entries(meetingInfo.members).forEach(([_, peer]: [string, User]) => {
            peer.sendMessage(jsonString)
        })
    }


    public sendMessage(jsonString: string) {
        this.ws.send(jsonString);
    }




}