import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.bitrixUsers, versionKey: false })
export class BitrixUsers {
    @Prop({ type: String, required: true })
    extension: string;

    @Prop({ type: String, required: true })
    bitrixId: string;
}

export const BitrixUsersSchema = SchemaFactory.createForClass(BitrixUsers);

export type BitrixUsersDocument = BitrixUsers & Document;