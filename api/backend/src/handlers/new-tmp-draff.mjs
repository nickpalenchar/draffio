import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';

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
  if (typeof event.body === 'object') {
    console.log('body is object, keys:', Object.keys(event.body));
  }
  const { body: draffBody } = JSON.parse(event.body);

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
    console.debug('uploading to s3');
    const s3Key = [username, draffName].join('/');
    const uploadReq = new Upload({
      client: s3,
      params: {
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: draffBody
      }
    });
    console.debug('formed request, uploading...');
    const result = await uploadReq.done();

    console.debug('successful result from s3: ', { result });

    const params = {
      TableName,
      Item: {
        username,
        draffname: draffName,
        s3Bucket: S3_BUCKET,
        s3Key,
        creationDate: Date.now(),
      }
    };
    console.debug('Constructed params for dynamo.', { params });
    await dynamo.send(new PutCommand(params));

    return response({
      statusCode: 201,
      body: JSON.stringify({
        draffName,
        username: 'tmp'
      }),
    })
    
  } catch (e) {
    console.error("Stopped in error: " + e.toString());
    return response({
      statusCode: 500,
      body: JSON.stringify({ ok: false, e: e.toString() })
    });
  }
};
