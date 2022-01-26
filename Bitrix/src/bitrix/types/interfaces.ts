import { DispositionStatus } from "@app/asterisk/types/interfaces";

export interface CallRegisterData {
  bitrixId: string, 
  phoneNumber: string, 
  type: BitrixCallType, 
  callTime: string
}

export interface CallFinishData {
  bitrixId: string, 
  userId: number, 
  bilsec: number, 
  callStatus: BitrixCallStatusType, 
  callType: BitrixCallType, 
  recording: string
}

export interface CreateTaskData {
  bitrixId: number, 
  incomingNumber: string, 
}

export interface OnExternalCallStart {
  USER_ID: number;
  PHONE_NUMBER: string;
  CRM_ENTITY_TYPE: string;
  CRM_ENTITY_ID: number;
  CALL_LIST_ID: number;
  LINE_NUMBER: string;
  CALL_ID: string;
  IS_MOBILE: number;
}

export interface BitirxUserGet {
    ID: string;
    ACTIVE: boolean;
    EMAIL: string;
    NAME: string;
    LAST_NAME: string;
    SECOND_NAME: string;
    PERSONAL_GENDER: string;
    PERSONAL_PROFESSION: string;
    PERSONAL_WWW: string;
    PERSONAL_BIRTHDAY: string;
    PERSONAL_PHOTO: string | null;
    PERSONAL_ICQ: string;
    PERSONAL_PHONE: string;
    PERSONAL_FAX: string;
    PERSONAL_MOBILE: string;
    PERSONAL_PAGER: string;
    PERSONAL_STREET: string;
    PERSONAL_CITY: string;
    PERSONAL_STATE: string;
    PERSONAL_ZIP: string;
    PERSONAL_COUNTRY: string;
    WORK_COMPANY: string;
    WORK_POSITION: string;
    WORK_PHONE: string;
    UF_DEPARTMENT: Array<number>;
    UF_INTERESTS: string | null;
    UF_SKILLS: string | null;
    UF_WEB_SITES: string | null;
    UF_XING: string | null;
    UF_LINKEDIN: string | null;
    UF_FACEBOOK: string | null;
    UF_TWITTER: string | null;
    UF_SKYPE: string | null;
    UF_DISTRICT: string | null;
    UF_PHONE_INNER: string;
    USER_TYPE: string;
}

export interface BitrixRegisterCallRequest {
  USER_PHONE_INNER?: string;
  USER_ID: number | string;
  PHONE_NUMBER: string;
  CALL_START_DATE?: string;
  CRM_CREATE?: CreateTaskType;
  CRM_SOURCE?: string;
  CRM_ENTITY_TYPE?: number;
  SHOW?: Show;
  CALL_LIST_ID?: number;
  LINE_NUMBER?: string;
  TYPE: BitrixCallType;
}

export interface BitrixRegisterCallResponse {
  CALL_ID: string;
  CRM_CREATED_LEAD: number;
  CRM_ENTITY_ID: number;
  CRM_ENTITY_TYPE: string;
  CRM_CREATED_ENTITIES: Array<string>;
  LEAD_CREATION_ERROR: string;
}

export interface ExternalCallShow {
  CALL_ID: string;
  USER_ID: number | Array<string>;
}

export interface ExternalCallHide {
  CALL_ID: string;
  USER_ID: number | Array<string>;
}

export interface BitrixExternalCallFinishRequest {
  CALL_ID: string;
  USER_ID: number;
  DURATION: number;
  COST_CURRENCY?: string;
  STATUS_CODE?: DispositionStatus | BitrixCallStatusType;
  FAILED_REASON?: string;
  RECORD_URL?: string;
  VOTE?: number;
  TYPE?: BitrixCallType;
  ADD_TO_CHAT?: number;
}
export interface BitrixTasksFields {
  fields: {
    ID?: number;
    PARENT_ID?: number;
    TITLE?: string;
    DESCRIPTION?: string;
    MARK?: string;
    PRIORITY?: string;
    STATUS?: string;
    MULTITASK?: string;
    NOT_VIEWED?: string;
    REPLICATE?: string;
    GROUP_ID?: number;
    STAGE_ID?: number;
    CREATED_BY?: number;
    CREATED_DATE?: Date;
    RESPONSIBLE_ID?: number;
    DEADLINE?: string;
  };
}

export interface BitrixFinishCallFields {
  CALL_ID: number;
  ID: number;
  CALL_TYPE: string;
  CALL_VOTE: string;
  COMMENT: string;
  PORTAL_USER_ID: number;
  PORTAL_NUMBER: string;
  PHONE_NUMBER: string;
  CALL_DURATION: string;
  CALL_START_DATE: string;
  COST: string;
  COST_CURRENCY: string;
  CALL_FAILED_CODE: string;
  CALL_FAILED_REASON: string;
  CRM_ACTIVITY_ID: number;
  CRM_ENTITY_ID: number;
  CRM_ENTITY_TYPE: string;
  REST_APP_ID: number;
  REST_APP_NAME: string;
  REDIAL_ATTEMPT: string;
  SESSION_ID: number;
  TRANSCRIPT_ID: number;
  TRANSCRIPT_PENDING: string;
  RECORD_FILE_ID: number;
}

export interface BitrixActivityFields {
  fields: {
    ASSOCIATED_ENTITY_ID?: number;
    AUTHOR_ID?: number;
    AUTOCOMPLETE_RULE?: number;
    BINDINGS?: string;
    COMMUNICATIONS?: Array<Object>;
    COMPLETED?: string;
    CREATED?: string;
    DEADLINE?: string;
    DESCRIPTION?: string;
    DESCRIPTION_TYPE?: string;
    DIRECTION?: string;
    EDITOR_ID?: number;
    END_TIME?: string;
    FILES?: string;
    ID?: number;
    LAST_UPDATE?: string;
    LOCATION?: string;
    NOTIFY_TYPE?: string;
    NOTIFY_VALUE?: number;
    ORIGINATOR_ID?: number;
    ORIGIN_ID?: string;
    ORIGIN_VERSION?: string;
    OWNER_ID?: number;
    OWNER_TYPE_ID?: number;
    PRIORITY?: string;
    PROVIDER_DATA?: string;
    PROVIDER_GROUP_ID?: number;
    PROVIDER_ID?: string;
    PROVIDER_TYPE_ID?: number;
    PROVIDER_PARAMS?: string;
    RESPONSIBLE_ID?: number;
    RESULT_CURRENCY_ID?: number;
    RESULT_MARK?: number;
    RESULT_SOURCE_ID?: number;
    RESULT_STATUS?: number;
    RESULT_STREAM?: number;
    RESULT_SUM?: string;
    RESULT_VALUE?: string;
    SETTINGS?: string;
    START_TIME?: string;
    STATUS?: string;
    SUBJECT?: string;
    TYPE_ID?: string;
    TYPE?: string;
    WEBDAV_ELEMENTS?: string;
  };
}


export interface CreateTaskResponse {
  result: {
    task: {
        id: string,
        title: string,
        description: string,
        descriptionInBbcode: string,
        declineReason: string,
        priority: string,
        status: string,
        notViewed: string,
        statusComplete: string,
        multitask: string,
        stageId: string,
        responsibleId: string,
        responsibleName: string,
        responsibleLastName: string,
        responsibleSecondName: string,
        responsibleLogin: string,
        responsibleWorkPosition: string,
        deadline: string,
        deadlineOrig: string,
        createdBy: string,
        createdByName: string,
        createdByLastName: string,
        createdByLogin: string,
        createdDate: string,
        changedBy: string,
        changedDate: string,
        statusChangedBy: string,
        statusChangedDate: string,
        closedBy: string,
        closedDate: string,
        }
    }
}


export interface GetTaskResponse {
  result: {
    task: {
        id: string,
        parentId: string,
        title: string,
        description: string,
        priority: string,
        status: string,
        responsibleId: string,
        deadline: string,        
        createdBy: string,
        createdDate: string,
        changedBy: string,
        changedDate: string,
        statusChangedBy: string,
        statusChangedDate: string,
        closedBy: string,
        closedDate: string,
        }
    }
}

export interface GetActivity {
  ID: string;
  fields?: {};
}

export const enum BitrixMetod {
  ExternalCallRegister = "telephony.externalcall.register.json",
  ExternalCallFinish = "telephony.externalcall.finish",
  ExternalCallSearch = "telephony.externalCall.searchCrmEntities",
  ExternalCallShow = "telephony.externalcall.show",
  ExternalCallHide = "telephony.externalcall.hide",
  TaskAdd = "tasks.task.add",
  TaskGet = "tasks.task.get",
  TaskUpdate = "tasks.task.update",
  UserGet = "user.get",
  CrmActivityGet = "crm.activity.get",
  CrmActivityDelete = "crm.activity.delete",
  CrmActivitUypdate = "crm.activity.update",
  CrmActivityAdd = "crm.activity.add",
}

export const enum ActiveUser {
  active = "true",
  inactive = "false",
}

export const enum BitrixCallType {
  incoming = 2,
  outgoing = 1,
  incomingRedirect = 3,
  callback = 4,
}

export const enum CrmCreate {
  YES = "1",
  NO = "false",
}

export const enum CreateTaskType {
  YES = 1,
  NO = 2,
}

export const enum CreateIncomingLead {
  YES = 0,
  NO = 1,
}

export const enum CreateOutgoingLead {
  YES = 0,
  NO = 1,
}

export const enum Show {
  YES = 0,
  NO = 1,
}

export const enum BitrixCallStatusType {
  SuccessfulCall = "200",
  MissedCall = "304",
  Rejected = "603",
  CallCanceled = "603-S",
  Forbidden = "403",
  WrongNumber = "404",
  Busy = "486",
  NotAvailableV1 = "484",
  NotAvailableV2 = "503",
  TemporarilyUnavailable = "480",
  Insufficient = "402",
  Block = "423",
  Other = "OTHER",
}

export interface FinishCallInfo {
  unicueid: string;
  bitrixUserId: string;
  incomingNumber: string;
  callType: BitrixCallType;
  startTime: string;
  billsec: string;
  isAnswer: BitrixCallStatusType;
  recording: string;
}

export interface ExternalCallRegister {
    startCallTime: string,
    callType: BitrixCallType,
    number: string,
    user: string
}