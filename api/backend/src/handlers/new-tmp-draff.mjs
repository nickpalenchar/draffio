import { Readable } from "stream";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const ENDPOINT_OVERRIDE = process.env.ENDPOINT_OVERRIDE;
let ddbClient;
if (ENDPOINT_OVERRIDE) {
    ddbClient = new DynamoDBClient({ endpoint: ENDPOINT_OVERRIDE });
}
else {
    ddbClient = new DynamoDBClient({});
    console.warn("No value for ENDPOINT_OVERRIDE provided for DynamoDB, using default");
}

const client = new DynamoDBClient({ apiVersion: "2012-08-10" });
const dynamo = DynamoDBDocumentClient.from(client);
const TableName = process.env.DRAFF_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const s3 = new S3();

const response = (obj) => {
  return { 
    ...obj,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN,
    }
  };
};
import crypto from "crypto";

// Generate a CUID using crypto
const generateCuid = () => {
  const randomBytes = crypto.randomBytes(10);
  const cuid = 'c' + randomBytes.toString('hex').replace(/[+/]/g, 'd').replace(/=+$/, '');
  return cuid;
};

export const handler = async (event) => {

  const { body: draffBody } = event.body;
  console.log('Parsed draff body', { draffBody });

  if (!draffBody) {
    return response({
      statusCode: 400,
      message: 'No body to save.'
    })
  }

  if (!TableName) {
    return response({ statusCode: 500, message: 'Cannot find table name.'});
  }
  if (!S3_BUCKET) {
    return response({statusCode: 500, message: 'No s3 bucket configured'});
  }
  console.log('Using Dynamo Tablename', { TableName })
  const username = 'tmp';
  const draffName = generateCuid();

  try {
    const result = await s3.putObject({
      Bucket: S3_BUCKET,
      Key: [username, draffName].join('/'),
      Body: Readable.from(draffBody),
    });

    console.log('successful result from s3: ', { result });

    const params = {
      TableName,
      Item: {
        username,
        draffName,
        creationDate: Date.now(),
      }
    };
    console.log('Constructed params for dynamo.', { TableName })
    await dynamo.send(new PutCommand(params));

    return response({
      statusCode: 201,
      draffName,
      username: 'tmp'
    })
    
  } catch (e) {
    return response({
      statusCode: 500,
      body: JSON.stringify({ ok: false, e: e.toString() })
    });
  }
};
