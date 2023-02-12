export interface ExternalCallInfo {
    id: number;
    callId: number;
    infoId: number;
    startTime: Date;
    isAnswered: boolean;
    talkingDur: string;
    recording?: string;
    lastCallUser: string;
}

export interface LocalCallInfo {
    isAnswered: boolean;
    recording?: string;
}