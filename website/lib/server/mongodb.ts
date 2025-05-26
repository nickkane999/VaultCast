import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Generic function to get a MongoDB collection by name
export async function getCollection(collectionName: string): Promise<Collection> {
  const client = await clientPromise;
  const db: Db = client.db(); // Use the default database name from the connection string
  return db.collection(collectionName);
}

// Function to get list of all collections in the database
export async function getCollectionNames(): Promise<string[]> {
  const client = await clientPromise;
  const db: Db = client.db();
  const collections = await db.listCollections().toArray();
  return collections.map((collection) => collection.name);
}

// Function to rename a collection
export async function renameCollection(oldName: string, newName: string): Promise<void> {
  const client = await clientPromise;
  const db: Db = client.db();
  const collection = db.collection(oldName);
  await collection.rename(newName);
}
