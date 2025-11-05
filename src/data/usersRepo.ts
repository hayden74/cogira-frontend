import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./ddb/client";
import { User } from "../types/user";

// Prefer env var if present; fallback to UsersTable for this PoC
const getTableName = (): string => process.env.USERS_TABLE || "UsersTable";

export async function getById(id: string): Promise<User | null> {
  const TableName = getTableName();
  const out = await docClient.send(new GetCommand({ TableName, Key: { id } }));
  return (out.Item as User) ?? null;
}

export async function create(user: User): Promise<void> {
  const TableName = getTableName();
  await docClient.send(
    new PutCommand({
      TableName,
      Item: user,
      ConditionExpression: "attribute_not_exists(#id)",
      ExpressionAttributeNames: { "#id": "id" },
    })
  );
}

export async function listAll(): Promise<User[]> {
  const TableName = getTableName();
  const out = await docClient.send(new ScanCommand({ TableName }));
  return (out.Items as User[]) ?? [];
}

export async function update(id: string, attrs: Partial<User>): Promise<void> {
  const TableName = getTableName();
  const existing = await getById(id);
  if (!existing) return;
  const updated: User = { ...existing, ...attrs, id };
  await docClient.send(
    new PutCommand({
      TableName,
      Item: updated,
      // Avoid upsert; ensure the item still exists
      ConditionExpression: "attribute_exists(#id)",
      ExpressionAttributeNames: { "#id": "id" },
    })
  );
}

export async function remove(id: string): Promise<void> {
  const TableName = getTableName();
  await docClient.send(new DeleteCommand({ TableName, Key: { id } }));
}
