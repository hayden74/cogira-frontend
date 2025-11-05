import { buildResponse } from '../../lib/http';
import type { AppRequest } from '../../lib/request';
import * as svc from '../../services/usersService';
import { CreateUserBodySchema, UpdateUserBodySchema } from './schemas';
import { AppError } from '../../lib/errors';
import { getLogger } from '../../lib/logger';

export async function listUsersOp(req: AppRequest) {
  const { method } = req;
  const logger = getLogger(req.correlationId);
  logger.info('Listing users');
  const users = await svc.listUsers();
  return buildResponse(200, { domain: 'users', method, users });
}

export async function getUserOp(req: AppRequest) {
  const { method } = req;
  const id = req.params?.id as string | undefined;
  if (!id || id === 'null' || id === 'undefined')
    throw AppError.badRequest('Invalid id parameter');
  const user = await svc.getUser(id);
  if (!user) throw AppError.notFound('User not found', { id });
  return buildResponse(200, { domain: 'users', method, user });
}

export async function createUserOp(req: AppRequest) {
  const { method, body } = req;
  const logger = getLogger(req.correlationId);
  const parsed = CreateUserBodySchema.safeParse(body ?? {});
  if (!parsed.success)
    throw AppError.badRequest('Invalid body', parsed.error.issues);
  logger.info('Creating user', { name: parsed.data.name });
  const user = await svc.createUser(parsed.data);
  return buildResponse(
    201,
    { domain: 'users', method, user },
    {
      Location: `/users/${user.id}`,
    }
  );
}

export async function updateUserOp(req: AppRequest) {
  const { method, body } = req;
  const id = req.params?.id as string | undefined;
  if (!id || id === 'null' || id === 'undefined')
    throw AppError.badRequest('Invalid id parameter');
  const logger = getLogger(req.correlationId);
  const parsed = UpdateUserBodySchema.safeParse(body ?? {});
  if (!parsed.success)
    throw AppError.badRequest('Invalid body', parsed.error.issues);
  logger.info('Updating user', { id });
  const user = await svc.updateUser(id, parsed.data);
  if (!user) throw AppError.notFound('User not found', { id });
  return buildResponse(200, { domain: 'users', method, user });
}

export async function deleteUserOp(req: AppRequest) {
  const id = req.params?.id as string | undefined;
  if (!id || id === 'null' || id === 'undefined')
    throw AppError.badRequest('Invalid id parameter');
  const logger = getLogger(req.correlationId);
  logger.info('Deleting user', { id });
  await svc.deleteUser(id);
  return buildResponse(204, undefined);
}

export async function handleUsers(req: AppRequest) {
  const { method } = req;
  const hasId = Boolean(req.params?.id);

  if (method === 'GET' && !hasId) return listUsersOp(req);
  if (method === 'GET' && hasId) return getUserOp(req);
  if (method === 'POST' && !hasId) return createUserOp(req);
  if ((method === 'PUT' || method === 'PATCH') && hasId)
    return updateUserOp(req);
  if (method === 'DELETE' && hasId) return deleteUserOp(req);

  return buildResponse(404, { message: 'Not Found', details: req.path });
}
