import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoAdapter } from '../adapter/mongo.adapter';
import { MongoRequestParamsInterface } from '../types/interfaces';
import { DbRequestType } from '../types/types';

@Injectable()
export class MongoService {

    constructor(@InjectConnection() private readonly connection: Connection) { }

    public async mongoRequest<T>(params: MongoRequestParamsInterface): Promise<T> {
        try {
            const { model, criteria, requestType, options, data } = new MongoAdapter(params, this.connection);
            return await this[this.getMethodByActionType(requestType)]({ model, criteria, options, data });
        } catch (e) {
            throw e;
        }
    }

    private getMethodByActionType(requestType: DbRequestType): any {
        switch (requestType) {
            case DbRequestType.findAll:
                return 'getList';
            case DbRequestType.findById:
                return 'getDocumentById';
            case DbRequestType.updateById:
                return 'updateDocumentById';
            case DbRequestType.insert:
                return 'insert';
            case DbRequestType.delete:
                return 'deleteDocumentById';
            case DbRequestType.deleteMany:
                return 'deleteCollection';
            case DbRequestType.insertMany:
                return 'insertMany';
        }
    }

    private async getList({ model, criteria, projection }): Promise<unknown> {
        try{
            return await model.find(criteria, projection);
        }catch(e){
            throw e
        }
    }

    private async getDocumentById({ model, criteria }): Promise<unknown> {
        try{
            return await model.findById(criteria.id);
        }catch(e){
            throw e
        }
    }

    private async updateDocumentById({ model, criteria }): Promise<unknown> {
        try{
            return await model.updateOne(criteria.id);
        }catch(e){
            throw e
        }
    }

    private async insert({ model, criteria }): Promise<unknown> {
        try{
            return await new model().save();
        }catch(e){
            throw e
        }
    }
    
    private async insertMany({ model, data }): Promise<unknown> {
        try{
            return await model.insertMany(data);
        }catch(e){
            throw e
        }
    }

    private async deleteDocumentById({ model, criteria }): Promise<unknown> {
        try{
            return await model.deleteOne(criteria.id);
        }catch(e){
            throw e
        }
    }

    private async deleteCollection({ model }): Promise<unknown> {
        try{
            return await model.deleteMany({});
        }catch(e){
            throw e
        }
        
    }
}
