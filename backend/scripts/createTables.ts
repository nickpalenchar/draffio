import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../src/config/dynamodb";

async function createTables() {
  try {
    const result = await client.send(new CreateTableCommand({
      TableName: "draff",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "gs1pk", AttributeType: "S" },
        { AttributeName: "gs1sk", AttributeType: "S" },
        { AttributeName: "gs2pk", AttributeType: "S" },
        { AttributeName: "gs2sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "gs1",
          KeySchema: [
            { AttributeName: "gs1pk", KeyType: "HASH" },
            { AttributeName: "gs1sk", KeyType: "RANGE" }
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: "gs2",
          KeySchema: [
            { AttributeName: "gs2pk", KeyType: "HASH" },
            { AttributeName: "gs2sk", KeyType: "RANGE" }
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
    }));
    console.log("Table created successfully:", result);
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

createTables(); 