import { MongoClient, Db } from "mongodb";

import { getDataStoreMode, requireEnv } from "@/lib/env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient(uri: string) {
  return new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

async function getMongoClient(): Promise<MongoClient> {
  if (getDataStoreMode() === "local") {
    throw new Error("Local storage mode enabled.");
  }

  const uri = requireEnv("MONGODB_URI");

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient(uri).connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : "Unknown database error."}`);
    });
  }

  return global._mongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.DATABASE_NAME?.trim() || "congolese-community-zimbabwe";
  return client.db(dbName);
}
