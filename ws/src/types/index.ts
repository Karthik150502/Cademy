import { User } from "../controllers/user"

export type IncomingMessageType<T> = {
    type: IncomingEvents,
    data: T
}

export type JoinMeeting = {
    userId: string,
    meetingId: string
}

export type WhiteboardUpdate = {
    stroke: CanvasStroke,
}


export type RecordStrokesType = {
    initialStrokes: CanvasStroke[]
}

export type MeetingInfoType = {
    organiserId: string,
    cursorHandler: string,
    members: {
        [id: string]: User,
    },
    whiteBoardState: CanvasStroke[],
    recordingId?: string,
    redisWhiteboardTimer?: NodeJS.Timeout
}

export type MeetingsType = Map<string, MeetingInfoType>;

export type CanvasStroke = {
    x: number,
    y: number,
    color: string,
    size: number,
    timeStamp: number;
    isNewStroke: boolean
}
export type LeaveMeeting = {
    userId: string,
    meetingId: string
}


export type IncomingData = JoinMeeting & LeaveMeeting & WhiteboardUpdate & RecordStrokesType;


export enum IncomingEvents {
    JOIN_MEETING = "join-meeting",
    LEAVE_MEETING = "leave-meeting",
    SHOW_MEETINGS = "show-meetings",
    STROKE_INPUT = "stroke-input",
    START_RECORDING = "start-recording",
    STOP_RECORDING = "stop-recording",
}