import {CollectionType,DbRequestType} from './types';

export interface PlainObject { [key: string]: any }

export interface MongoRequestParamsInterface {
    criteria?: PlainObject;
    entity: CollectionType;
    requestType: DbRequestType;
    data?: PlainObject;
    fields?: { [name: string]: number };
}

export interface MongoApiResultInterface {
    result: boolean;
    requestType: DbRequestType;
    data?: any;
    message?: any;
    entity: CollectionType;
}

export interface PhonebookStruct {
    _id: string;
    company: string;
    fio: string;
    extension: string;
    create: string;
}