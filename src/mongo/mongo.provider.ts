import { Schemas } from './config';
import { Schema } from 'mongoose';

export default (): { name: string; schema: Schema }[] => {
  return Object.values(Schemas).map((s) => ({
    name: s.class.name,
    schema: s.schema,
  }));
};