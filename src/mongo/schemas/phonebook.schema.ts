import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.phonebook, versionKey: false })
export class Phonebook {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: String, required: true })
    company: string;

    @Prop({ type: String, required: true })
    fio: string;

    @Prop({ type: String })
    extension: string = "";

    @Prop()
    create: Date;
}

export const PhonebookSchema = SchemaFactory.createForClass(Phonebook);

export type PhonebookDocument = Phonebook & Document;