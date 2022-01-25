import { CollectionType, SchemaType } from './types/types';
import { Phonebook, PhonebookSchema, BitrixUsers, BitrixUsersSchema } from './schemas';

export const Schemas: SchemaType = {
  [CollectionType.phonebook]: { schema: PhonebookSchema, class: Phonebook },
  [CollectionType.bitrixUsers]: { schema: BitrixUsersSchema, class: BitrixUsers },

};