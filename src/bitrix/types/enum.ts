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
    ExternalCallAttachRecord = "telephony.externalCall.attachRecord",
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
    NO = "0",
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
  