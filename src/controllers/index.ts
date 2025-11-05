import { HandlerRegistry } from '../lib/router';
import { handleUsers } from './users/userController';

export const handlerRegistry: HandlerRegistry = {
  users: handleUsers,
};
