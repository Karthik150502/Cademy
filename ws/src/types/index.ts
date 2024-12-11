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
    isRecording: boolean,
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

export type StartRecordingPlay = {
    recordingId: string
}
export type PauseRecording = {
    offSet: string
}


export type IncomingData = JoinMeeting & LeaveMeeting & WhiteboardUpdate & RecordStrokesType & StartRecordingPlay & PauseRecording;


export enum IncomingEvents {
    JOIN_MEETING = "join-meeting",
    LEAVE_MEETING = "leave-meeting",
    SHOW_MEETINGS = "show-meetings",
    STROKE_INPUT = "stroke-input",
    START_RECORDING = "start-recording",
    STOP_RECORDING = "stop-recording",
    PING_CHECK = "ping-check",
    PLAY_RECORDING = "start-replay",
    PLAY = "play",
    PAUSE = "pause",
}
export enum OutgoingEvents {
    RECORDING_STARTED = "recording-started",
    RECORDING_STOPPED = "recording-stopped",
    USER_JOINED = "user-joined",
    STROKE_INPUT = "stroke-input",
    STARTING_REPLAY = "starting-replay",
}