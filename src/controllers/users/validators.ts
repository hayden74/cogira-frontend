import Ajv, { type ErrorObject, type JSONSchemaType } from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const disallowScriptPattern = '^(?!.*<script>)(?!.*</script>)[\\s\\S]{1,100}$';

export type CreateUserBody = {
  firstName: string;
  lastName: string;
};

const createUserSchema: JSONSchemaType<CreateUserBody> = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: disallowScriptPattern,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: disallowScriptPattern,
    },
  },
  required: ['firstName', 'lastName'],
  additionalProperties: false,
};

export const validateCreateUser = ajv.compile(createUserSchema);

export type UpdateUserBody = Partial<CreateUserBody>;

const updateUserSchema: JSONSchemaType<UpdateUserBody> = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: disallowScriptPattern,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: disallowScriptPattern,
    },
  },
  required: [],
  additionalProperties: false,
  minProperties: 1,
};

export const validateUpdateUser = ajv.compile(updateUserSchema);

export const formatValidationErrors = (
  errors: ErrorObject[] | null | undefined
) =>
  (errors ?? []).map((error) => ({
    message: error.message ?? 'Invalid input',
    path: error.instancePath,
  }));
