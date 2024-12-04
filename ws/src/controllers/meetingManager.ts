import { WebSocket } from "ws";
import { User } from "./user";
import { CanvasStroke, MeetingInfoType, MeetingsType } from "../types";




export class MeetingManager {

    public static meetings: MeetingsType = new Map<string, MeetingInfoType>();
    public static instance: MeetingManager = new MeetingManager();


    private constructor() {
    }


    static addUser(meetingId: string, user: User) {
        let meetingChannel = this.meetings.get(meetingId);
        const userId = user.getuserId()!;
        if (!meetingChannel) {
            let meetingInfo: MeetingInfoType = {
                organiserId: userId,
                cursorHandler: userId,
                members: {
                    [userId]: user
                },
                whiteBoardState: []
            }

            this.meetings.set(meetingId, meetingInfo);
            meetingChannel = this.meetings.get(meetingId);
        }
        user.setMeetingId(meetingId);
        meetingChannel!.members[userId] = user;

    }

    static removeUser(meetingId: string, user: User) {
        delete this.meetings.get(meetingId)?.members[user.getuserId()!]
        user.setMeetingId(null);
    }

    static getMeeting(meetingId: string) {
        const meeting = this.meetings.get(meetingId)
        if (!meeting) {
            return null;
        }
        else return meeting;
    }

    static getInstance() {
        return this.instance;
    }
    static updateWhiteboard(stroke: CanvasStroke, meetingId: string) {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) { return; }
        meeting.whiteBoardState.push(stroke);
        this.broadcast(meetingId, JSON.stringify({
            type: 'stroke-input',
            stroke
        }));
    }


    static getMeetingDetails() {
        console.log(this.meetings)
    }



    static broadcast(meetingId: string, jsonString: string) {
        let meetingInfo = this.meetings.get(meetingId)
        if (!meetingInfo) {
            return;
        }
        Object.entries(meetingInfo.members).map(([_, peer]: [string, User]) => {
            peer.sendMessage(jsonString)
        })
    }

}