import { HandlerRegistry } from '../lib/router';
import { handleUsers } from './users/userController';
import { handleDocs } from './docs/docsController';

export const handlerRegistry: HandlerRegistry = {
  users: handleUsers,
  docs: handleDocs,
};
