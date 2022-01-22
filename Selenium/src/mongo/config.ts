import { CollectionType, SchemaType } from './types/types';
import { Phonebook, PhonebookSchema } from './schemas';

export const Schemas: SchemaType = {
  [CollectionType.phonebook]: { schema: PhonebookSchema, class: Phonebook },

};