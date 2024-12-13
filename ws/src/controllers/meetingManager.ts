import { CanvasStroke, MeetingInfoType, MeetingsType } from "../types";
import { KafkaHandler, RedisManager, User } from "./index";




export class MeetingManager {

    public static meetings: MeetingsType = new Map<string, MeetingInfoType>();
    public static instance: MeetingManager = new MeetingManager();


    private constructor() {
    }


    static addUser(meetingId: string, user: User) {
        let meetingChannel = this.meetings.get(meetingId);
        const userId = user.id!;
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
        delete this.meetings.get(meetingId)?.members[user.id!]
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
    static async updateWhiteboard(stroke: CanvasStroke, meetingId: string) {
        const meeting = this.meetings.get(meetingId);
        // const recordingId = meeting?.recordingId!;
        if (meeting?.isRecording) {
            const payload = JSON.stringify(stroke)
            await RedisManager.pushStrokeToRedis(meetingId, payload);
            // await KafkaHandler.produceToTopic(`whiteboard-${recordingId}`, payload);
        }
        meeting!.whiteBoardState.push(stroke);
    }

    static async startWhiteBoardRecording(meetingId: string, initialState: CanvasStroke[]) {
        let recordingId = await RedisManager.initialLoadToDatabase(meetingId, initialState);
        const meeting = this.meetings.get(meetingId);
        if (!meeting) { return; }
        meeting.recordingId = recordingId;
        meeting.isRecording = true;
        meeting.redisWhiteboardTimer = RedisManager.startStrokeFetchFromRedis(meetingId, recordingId);
        return recordingId;
    }

    static async startRecording(meetingId: string, initialWhiteboardState: CanvasStroke[]) {
        // KafkaHandler.connectProducer();
        await this.startWhiteBoardRecording(meetingId, initialWhiteboardState);
        // await KafkaHandler.createTopic(`whiteboard-${recordingId}`)
    }

    static async stopRecording(meetingId: string) {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) { return; }
        clearTimeout(meeting.redisWhiteboardTimer);
        RedisManager.stopStrokeFetchFromRedis(meetingId, meeting.recordingId!);
        meeting.recordingId = undefined;
        meeting.isRecording = false;
        await KafkaHandler.disconnectProducer();
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
            if (userId !== peerId) {
                peer.sendMessage(jsonString)
            }
        })
    }



    static checkUserPresentInMeeting(meetingId: string) {
        let meeting = this.meetings.get(meetingId);
        if (!meeting) {
            return false;
        }
        return true;
    }
}



