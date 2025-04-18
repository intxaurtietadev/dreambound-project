import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db: Db;

export async function conectarDB(): Promise<Db> {
  if (!db) {
    try {
      await client.connect();
      db = client.db("miBaseDeDatos");
      console.log("✅ Conectado a MongoDB");
    } catch (error) {
      console.error("❌ Error de conexión a MongoDB:", error);
      throw error;
    }
  }
  return db;
}

export { client };