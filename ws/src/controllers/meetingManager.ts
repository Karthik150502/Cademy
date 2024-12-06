import { WebSocket } from "ws";
import { User } from "./user";
import { CanvasStroke, MeetingInfoType, MeetingsType } from "../types";
import { RedisManager } from "./redisManagerWhiteboard";




export class MeetingManager {

    public static meetings: MeetingsType = new Map<string, MeetingInfoType>();
    public static instance: MeetingManager = new MeetingManager();


    private constructor() {
    }


    static addUser(meetingId: string, user: User) {
        let meetingChannel = this.meetings.get(meetingId);
        const userId = user.getUserId()!;
        if (!meetingChannel) {
            let meetingInfo: MeetingInfoType = {
                organiserId: userId,
                cursorHandler: userId,
                members: {
                    [userId]: user
                },
                whiteBoardState: [],
                isRecording: false
            }

            this.meetings.set(meetingId, meetingInfo);
            meetingChannel = this.meetings.get(meetingId);
        }
        user.setMeetingId(meetingId);
        meetingChannel!.members[userId] = user;

    }

    static removeUser(meetingId: string, user: User) {
        delete this.meetings.get(meetingId)?.members[user.getUserId()!]
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
    static updateWhiteboard(userId: string, stroke: CanvasStroke, meetingId: string) {
        const meeting = this.meetings.get(meetingId);
        if (meeting?.isRecording) {
            RedisManager.pushStrokeToRedis(meetingId, stroke);
        }
        meeting!.whiteBoardState.push(stroke);
        this.broadcast(userId, meetingId, JSON.stringify({
            type: 'stroke-input',
            stroke
        }));
    }

    static async startWhiteBoardRecording(meetingId: string, initialState: CanvasStroke[]) {
        let recordingId = await RedisManager.initialLoadToDatabase(meetingId, initialState);
        const meeting = this.meetings.get(meetingId);
        if (!meeting) { return; }
        meeting.recordingId = recordingId;
        meeting.isRecording = true;
        meeting.redisWhiteboardTimer = RedisManager.startStrokeFetchFromRedis(meetingId, recordingId);
    }
    static async startRecording(meetingId: string, initialWhiteboardState: CanvasStroke[]) {
        this.startWhiteBoardRecording(meetingId, initialWhiteboardState);
    }

    static async stopRecording(meetingId: string) {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) { return; }
        clearTimeout(meeting.redisWhiteboardTimer);
        RedisManager.stopStrokeFetchFromRedis(meetingId, meeting.recordingId!);
        meeting.recordingId = undefined;
        meeting.isRecording = false;
    }


    static getMeetingDetails() {
        console.log(this.meetings)
    }

    static removeMeetingsData(meetingId: string) {
        this.meetings.delete(meetingId);
    }


    static broadcast(userId: string, meetingId: string, jsonString: string) {
        let meetingInfo = this.meetings.get(meetingId)
        if (!meetingInfo) {
            return;
        }

        Object.entries(meetingInfo.members).forEach(([peerId, peer]: [string, User]) => {
            console.log("userid, Id", userId, peerId)
            if (userId !== peerId) {
                peer.sendMessage(jsonString)
            }
        })
    }

}