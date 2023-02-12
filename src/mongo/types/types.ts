import { Document, Schema } from 'mongoose';
import { BitrixUsers, Phonebook, Tasks } from '../schemas';

export enum CollectionType {
  phonebook = 'phonebook',
  bitrixUsers = 'bitrixUsers',
  tasks = 'tasks'
}

export enum DbRequestType {
  findAll = 'findAll',
  findById = 'findById',
  updateById = 'updateById',
  insert = 'insert',
  delete = 'delete',
  deleteMany = 'deleteMany',
  insertMany = 'insertMany'
}


export type SchemaType = {
  [key in CollectionType]?: {
    schema: Schema<Document>;
    class: SchemaClassType;
  };
};

type SchemaClassType = typeof Phonebook | typeof BitrixUsers | typeof Tasks;
