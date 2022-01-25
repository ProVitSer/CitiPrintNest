import { Document, Schema } from 'mongoose';
import { Phonebook } from '../schemas';

export enum CollectionType {
  phonebook = 'phonebook',
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

type SchemaClassType = typeof Phonebook;
