import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Optional endpoint override for local/test (e.g., DynamoDB Local)
const endpoint = process.env.ENDPOINT_OVERRIDE || process.env.DDB_ENDPOINT;

const baseClient = new DynamoDBClient(endpoint ? { endpoint } : {});

export const docClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});
