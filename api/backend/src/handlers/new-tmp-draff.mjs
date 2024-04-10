import crypto from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3 } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

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
  const { code: draffBody } = JSON.parse(event.body);

  console.debug('Parsed draff body', { draffBody });

  if (!draffBody) {
    return response({
      statusCode: 400,
      body: JSON.stringify({ message: 'No body to save.', ok: false })
    });
  }

  if (!TableName) {
    return response({
      statusCode: 500,
      body: JSON.stringify({message: 'Cannot find table name.' })
    });
  }
  if (!S3_BUCKET) {
    return response({
      statusCode: 500, 
      body: JSON.stringify({message: 'No s3 bucket configured'})
    });
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
