import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Función auxiliar para obtener variables de entorno
function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

// Inicializar cliente de Pinecone
const pinecone = new Pinecone({
  apiKey: getEnvVariable("PINECONE_API_KEY"),
});

console.log("Pinecone initialized successfully");