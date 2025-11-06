export const usersDoc = {
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        responses: {
          '200': {
            description: 'A list of users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserListResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUser' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      parameters: [
        {
          name: 'id',
          required: true,
          in: 'path',
          schema: { type: 'string' },
        },
      ],
      get: {
        summary: 'Get a user by id',
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
          },
        },
      },
      put: {
        summary: 'Replace a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUser' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update user fields',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUser' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a user',
        responses: {
          '204': {
            description: 'User deleted',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateUser: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 100 },
          lastName: { type: 'string', minLength: 1, maxLength: 100 },
        },
        required: ['firstName', 'lastName'],
        additionalProperties: false,
      },
      UpdateUser: {
        type: 'object',
        properties: {
          firstName: { type: 'string', minLength: 1, maxLength: 100 },
          lastName: { type: 'string', minLength: 1, maxLength: 100 },
        },
        additionalProperties: false,
        minProperties: 1,
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          modifiedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'firstName', 'lastName', 'createdAt', 'modifiedAt'],
      },
      UserResponse: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          method: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['domain', 'method', 'user'],
      },
      UserListResponse: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          method: { type: 'string' },
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          nextToken: { type: 'string', nullable: true },
        },
        required: ['domain', 'method', 'users'],
      },
    },
  },
};
