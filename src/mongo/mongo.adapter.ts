import { Connection, Document, Model, QueryOptions } from "mongoose";
import { Schemas } from "./config";
import {PlainObject,MongoRequestParamsInterface} from './types/interfaces';
import {DbRequestType,CollectionType} from './types/types';

export class MongoAdapter{

    model: Model<Document>;
    criteria?: PlainObject;
    requestType: DbRequestType;
    data?: PlainObject;
    options?: QueryOptions;


    constructor(params: MongoRequestParamsInterface, connection: Connection) {
        const collection = CollectionType[params.entity];
        this.model = this.getModel(connection, collection);
        this.requestType = params.requestType;
        this.data = params.data;
        this.criteria = params.criteria;
    }


    private getModel(connection: Connection, collection: CollectionType): Model<Document> {
        return connection?.models[Schemas[collection]?.class.name];
    }
}