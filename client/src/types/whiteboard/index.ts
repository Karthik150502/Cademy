export type CanvasStroke = {
    x: number,
    y: number,
    color: string,
    size: number,
    timeStamp: number;
    isNewStroke: boolean
}



export enum OutgoingEvents {
    JOIN_MEETING = "join-meeting",
    LEAVE_MEETING = "leave-meeting",
    SHOW_MEETINGS = "show-meetings",
    STROKE_INPUT = "stroke-input",
    START_RECORDING = "start-recording",
    STOP_RECORDING = "stop-recording",
}
export enum IncomingEvents {
    RECORDING_STARTED = "recording-started",
    RECORDING_STOPPED = "recording-stopped",
    USER_JOINED = "user-joined",
    STROKE_INPUT = "stroke-input",
    USER_LEFT = "user-left",
}


export enum ReplayIncomingEvents {
    STARTING_REPLAY = "starting-replay",
    STROKE_REPLAY = "stroke-replay",
    REPLAY_INITIALSTATE = "replay-initialstate",
} 