import { ElectroDB } from "electrodb";
import { documentClient } from "../config/dynamodb";

// ElectroDB configuration
export const electroConfig = {
  client: documentClient,
  table: process.env.DYNAMODB_TABLE || 'draff',
  // Optional: only include in development
  ...(process.env.NODE_ENV === 'development' && {
    logger: console,
  })
};

// Export a function to create new entities
export function createEntity<T extends Record<string, any>>(
  config: T
): ElectroDB {
  return new ElectroDB(config, electroConfig);
} 