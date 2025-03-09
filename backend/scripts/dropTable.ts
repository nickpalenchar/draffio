import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../src/config/dynamodb";

async function dropTable() {
  try {
    const result = await client.send(new DeleteTableCommand({
      TableName: "draff"
    }));
    console.log("Table deleted successfully:", result);
  } catch (err) {
    console.error("Error deleting table:", err);
  }
}

dropTable(); 