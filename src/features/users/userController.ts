import { buildResponse } from '../../lib/http';
import type { AppRequest } from '../../lib/request';
import * as svc from './usersService';
import {
  validateCreateUser,
  validateUpdateUser,
  formatValidationErrors,
  type CreateUserBody,
  type UpdateUserBody,
} from './validators';
import { AppError } from '../../lib/errors';
import { getLogger } from '../../lib/logger';
import type { UserListResult } from '../../types/user';

export async function listUsersOp(req: AppRequest) {
  const { method, query } = req;
  const logger = getLogger(req.correlationId);
  const { nextToken, limit: limitRaw } = query ?? {};
  let limit: number | undefined;
  if (limitRaw !== undefined) {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw AppError.badRequest('Invalid limit parameter.');
    }
    limit = parsed;
  }
  logger.info('Listing users', { limit, hasNextToken: Boolean(nextToken) });
  let usersResponse: UserListResult | undefined;
  try {
    usersResponse = await svc.listUsers({
      limit,
      nextToken: nextToken ?? undefined,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid pagination token'
    ) {
      throw AppError.badRequest('Invalid pagination token');
    }
    throw error;
  }
  const { users, nextToken: token } =
    usersResponse ?? ({ users: [], nextToken: undefined } as UserListResult);
  return buildResponse(200, {
    domain: 'users',
    method,
    users,
    ...(token ? { nextToken: token } : {}),
  });
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
  const payload = (body ?? {}) as unknown;
  if (!validateCreateUser(payload)) {
    throw AppError.badRequest(
      'Invalid body',
      formatValidationErrors(validateCreateUser.errors)
    );
  }
  const data = payload as CreateUserBody;
  logger.info('Creating user', { name: data.firstName });
  const user = await svc.createUser(data);
  return buildResponse(
    201,
    { domain: 'users', method, user },
    {
      Location: `${req.basePath || ''}/users/${user.id}`,
    }
  );
}

export async function updateUserOp(req: AppRequest) {
  const { method, body } = req;
  const id = req.params?.id as string | undefined;
  if (!id || id === 'null' || id === 'undefined')
    throw AppError.badRequest('Invalid id parameter');
  const logger = getLogger(req.correlationId);
  const payload = (body ?? {}) as unknown;
  if (!validateUpdateUser(payload)) {
    throw AppError.badRequest(
      'Invalid body',
      formatValidationErrors(validateUpdateUser.errors)
    );
  }
  const data = payload as UpdateUserBody;
  logger.info('Updating user', { id });
  const user = await svc.updateUser(id, data);
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
