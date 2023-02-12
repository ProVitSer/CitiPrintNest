import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.tasks, versionKey: false })
export class Tasks {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: String, required: true })
    taskId: string;

    @Prop({ type: String, required: true })
    bitrixUserId: string;

    @Prop({ type: String, required: true })
    extension: string;

    @Prop()
    create: Date;
}

export const TasksSchema = SchemaFactory.createForClass(Tasks);

export type TasksDocument = Tasks & Document;