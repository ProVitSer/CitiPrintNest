import { ApplicationTypes, AsteriskCause, AsteriskChannelStateDesc, AsteriskEvent, CallTypeContext, Context, StatusExtensionStatus, StatustextExtensionStatus, TrunkId } from "./enum";

export interface AsteriskHangupEvent {
    lines: [string],
    EOL: string;
    variables: string;
    event: AsteriskEvent;
    privilege: string;
    channel: string;
    channelstate: string;
    channelstatedesc: AsteriskChannelStateDesc;
    calleridnum: string;
    calleridname: string;
    connectedlinenum: string;
    connectedlinename: string;
    language: string;
    accountcode: string;
    context: CallTypeContext;
    exten: string;
    priority: string;
    uniqueid: string;
    linkedid: string;
    extension: string;
    application?: ApplicationTypes;
    appdata?: string;
    cause?: AsteriskCause;
}

export interface AsteriskHangupIncomingEventAppData {
    unicueid: string;
    incomingNumber: string;
    billsec: string;
    disposition: string;
    recording: string;
    start: string;
    end: string; 
}

export interface AsteriskHangupOutgoingEventAppData {
    exten: string;
    unicueid: string;
    extensionNumber: string;
    billsec: string;
    disposition: string;
    recording: string;
    start: string;
    end: string;
}

export interface AsteriskExtensionStatusEvent {
    lines: [string],
    EOL: string;
    variables: object;
    event: AsteriskEvent;
    privilege: string;
    exten: string;
    context: string;
    hint: string;
    status: StatusExtensionStatus;
    statustext: StatustextExtensionStatus;
}

export interface AsteriskARIStasisStartEvent {
    type: string;
    timestamp: string;
    args: string[],
    channel: {
      id: string;
      name: string;
      state: string;
      caller: { 
            name: string;
            number: string;
        },
      connected: { 
          name: string;
          number: string;
        },
      accountcode: string;
      dialplan: {
        context: string;
        exten: string;
        priority: number;
        app_name: string;
        app_data: string;
      },
      creationtime: string;
      language: string;
    },
    asterisk_id: string;
    application: string;
}

export interface AsteriskStatusResponse {
    lines: Array<string>,
    EOL: string,
    variables: object,
    response: string,
    actionid: string,
    eventlist: string,
    message: string,
    events: EventsStatus[],
}

export interface EventsStatus {
    lines: Array<string>,
    EOL: string,
    variables: object,
    event: string,
    privilege?: string,
    channel?: string,
    channelstate?: string,
    channelstatedesc?: string,
    calleridnum?: string,
    calleridname?: string,
    connectedlinenum?: string,
    connectedlinename?: string,
    language?: string,
    accountcode?: string,
    context?: string,
    exten?: string,
    priority?: string,
    uniqueid?: string,
    linkedid?: string,
    type?: string,
    dnid?: string,
    effectiveconnectedlinenum?: string,
    effectiveconnectedlinename?: string,
    timetohangup?: string,
    bridgeid?: string,
    application?: string,
    data?: string,
    nativeformats?: string,
    readformat?: string,
    readtrans?: string,
    writeformat?: string,
    writetrans?: string,
    callgroup?: string,
    pickupgroup?: string,
    seconds?: string,
    actionid?: string,
    eventlist?: string,
    listitems?: string,
    items?: string,
}

export interface AsteriskDNDStatusResponse {
    lines: Array<string>,
    EOL: string,
    variables: object,
    response: string,
    actionid: string,
    eventlist: string,
    message: string,
    events: DNDStatus,
}

export interface DNDStatus {
    lines: string[],
    EOL: string,
    variables: object,
    event: string,
    family: string,
    key: string,
    val: string,
    actionid: string
}

export interface RouteInfo {
    trunkId: TrunkId;
    defaultContext: Context,
    localContext: Context
}