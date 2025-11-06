import { Entity, EntityRepository, Table, schema } from 'dynamodb-toolbox';
import { docClient } from './ddb/client';

const USERS_TABLE_NAME = process.env.USERS_TABLE || 'UsersTable';
export const USER_ENTITY_TYPE = 'USER';
export const USER_ENTITY_INDEX = 'ByEntityType';

export const usersTable = new Table({
  name: USERS_TABLE_NAME,
  partitionKey: { name: 'id', type: 'string' },
  documentClient: docClient,
  indexes: {
    [USER_ENTITY_INDEX]: {
      type: 'global',
      partitionKey: { name: 'entityType', type: 'string' },
      sortKey: { name: 'createdAt', type: 'string' },
    },
  },
});

export const userEntity = new Entity({
  name: 'User',
  table: usersTable,
  entityAttribute: false,
  timestamps: false,
  schema: schema.item({
    id: schema.string().key(),
    firstName: schema.string().required('always'),
    lastName: schema.string().required('always'),
    createdAt: schema.string().required('always'),
    modifiedAt: schema.string().required('always'),
    entityType: schema.string().const(USER_ENTITY_TYPE).hidden(true),
  }),
} as const);

export type UserItem = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  modifiedAt: string;
  entityType: typeof USER_ENTITY_TYPE;
};
export const userRepository = userEntity.build(EntityRepository);
