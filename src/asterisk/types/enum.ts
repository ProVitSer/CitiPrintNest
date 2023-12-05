export enum ApplicationTypes {
    noOp = 'NoOp'
}


export enum AsteriskEvent {
    Hangup = "Hangup",
    ExtensionStatus = "ExtensionStatus"
}

export enum StatustextExtensionStatus {
    InUse = 'InUse',
    Idle = "Idle",
    Ringing = "Ringing"
}

export enum StatusExtensionStatus {
    InUse = '1',
    Idle = "0",
    Ringing = "8"
}

export enum AsteriskChannelStateDesc {
    Up = "Up",
    Down = "Down",
    Busy = "Busy"
}
export enum statusDND {
    on = '1',
    off = ''
}

export enum statusHint {
    on ='Busy',
    off = 'Unavailable'
}

export enum AsteriskCause {
    UNALLOCATED = "1",
    NO_ROUTE_TRANSIT_NET = "2",
    NO_ROUTE_DESTINATION = "3",
    CHANNEL_UNACCEPTABLE = "6",
    CALL_AWARDED_DELIVERED = "7",
    NORMAL_CLEARING = "16",
    USER_BUSY = "17",
    NO_USER_RESPONSE = "18",
    NO_ANSWER = "19",
    CALL_REJECTED = "21",
    NUMBER_CHANGED = "22",
    DESTINATION_OUT_OF_ORDER = "27",
    INVALID_NUMBER_FORMAT = "28",
    FACILITY_REJECTED = "29",
    RESPONSE_TO_STATUS_ENQUIRY = "30",
    NORMAL_UNSPECIFIED = "31",
    NORMAL_CIRCUIT_CONGESTION = "34",
    NETWORK_OUT_OF_ORDER = "38",
    NORMAL_TEMPORARY_FAILURE = "41",
    SWITCH_CONGESTION = "42",
    ACCESS_INFO_DISCARDED = "43",
    REQUESTED_CHAN_UNAVAIL = "44",
    PRE_EMPTED = "45",
    FACILITY_NOT_SUBSCRIBED = "50",
    OUTGOING_CALL_BARRED = "52",
    INCOMING_CALL_BARRED = "54",
    BEARERCAPABILITY_NOTAUTH = "57",
    BEARERCAPABILITY_NOTAVAIL = "58",
    BEARERCAPABILITY_NOTIMPL = "65",
    CHAN_NOT_IMPLEMENTED = "66",
    FACILITY_NOT_IMPLEMENTED = "69",
    INVALID_CALL_REFERENCE = "81",
    INCOMPATIBLE_DESTINATION = "88",
    INVALID_MSG_UNSPECIFIED = "95",
    MANDATORY_IE_MISSING = "96",
    MESSAGE_TYPE_NONEXIST = "97",
    WRONG_MESSAGE = "98",
    IE_NONEXIST = "99",
    INVALID_IE_CONTENTS = "100",
    WRONG_CALL_STATE = "101",
    RECOVERY_ON_TIMER_EXPIRE = "102",
    MANDATORY_IE_LENGTH_ERROR = "103",
    PROTOCOL_ERROR = "111",
    INTERWORKING = "127",
    NOT_DEFINED = "0",
}

export enum CallTypeContext {
    Incoming = "incoming-hangup-handler",
    Outgoing = "outbound-hangup-handler",
}



export enum DispositionStatus {
    "NO ANSWER" = "480",
    "ANSWERED" = "200",
    "BUSY" = "486",
}

export enum AsteriskCallStatus {
    NOANSWER = "NO ANSWER",
    ANSWERED = "ANSWERED",
    BUSY = "BUSY",
}



export enum Context {
    localBaza = 'RouteToLocalUserBaza',
    defaultBaza = 'RouteToDefaultIncomingRouteBaza',
    localMultifon = 'RouteToLocalUserMultifon',
    defaultMultifon = 'RouteToDefaultIncomingRouteMultifon'
}

export enum TrunkId {
    baza = '00018',
    miltifon = '79264612222'
};