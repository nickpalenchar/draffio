import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
//DynamoDB Endpoint
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
const s3 = new S3();

const response = (obj) => {
  return { 
    ...obj,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN,
    }
  };
};


export const handler = async (event) => {
  
  const { draffName, username } = event.pathParameters;
  
  if (!TableName) {
    return response({ statusCode: 500, message: 'Cannot find table name.'});
  }
  console.log('Using Dynamo Tablename', { TableName })
  console.log('Params:', { draffName, username })
  if (!draffName || !username) {
    return response({
      statusCode: 404,
      body: JSON.stringify({ error: "Draff not found.", event}),
    });
  }
  try {
    const params = {
      TableName,
      Key: {
        username: username.replace(/^@/, ''),
        draffname: draffName,
      }
    };
    console.log('Constructed params for dynamo.', { TableName })
    const result = await dynamo.send(new GetCommand(params));
    
    if (!result.Item) {
      console.error('No Item found in database')
      return response({
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found", $from: "Table Query Result" })
      });
    }
    console.log('Using s3 bucket from Db', { Bucket: result.Item.s3Bucket });
    const s3Result = await s3.send(new GetObjectCommand({
      Bucket: result.Item.s3Bucket,
      Key: result.Item.s3Key
    }));
    const code = await s3Result.Body?.transformToString('utf-8');
    if (code === undefined) {
      throw new Error("No Data.");
    }
    return response({
      statusCode: 200,
      body: JSON.stringify({ text: code }),
    });
  } catch (e) {
    return response({
      statusCode: 404,
      body: JSON.stringify({ ok: false, e: e.toString() })
    });
  }
};
