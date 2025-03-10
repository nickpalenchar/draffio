import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isTest = process.env.NODE_ENV === 'test';
const isLocal = process.env.NODE_ENV === 'development' || isTest;

export const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isLocal && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  }),
});

export const documentClient = DynamoDBDocumentClient.from(client); 