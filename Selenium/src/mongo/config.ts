import { CollectionType, SchemaType } from './types/types';
import { Phonebook, PhonebookSchema } from './schemas';

export const Schemas: SchemaType = {
  [CollectionType.Phonebook]: { schema: PhonebookSchema, class: Phonebook },

};