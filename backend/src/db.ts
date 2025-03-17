import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db: Db;

// Función para conectar a la base de datos
export async function conectarDB(): Promise<Db> {
  if (!db) {
    try {
      await client.connect();
      db = client.db("miBaseDeDatos"); // Aquí usas el nombre de tu base de datos
      console.log("✅ Base de datos conectada");
    } catch (error) {
      console.error("❌ Error al conectar a la base de datos:", error);
      throw error;
    }
  }
  return db;
}

// Exponer `client` para poder cerrarlo desde otro archivo
export { client };
