import { Pinecone } from "@pinecone-database/pinecone";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs-node";
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

let model: use.UniversalSentenceEncoder;

async function loadModel() {
  console.log("Cargando modelo Universal Sentence Encoder...");
  model = await use.load();
  console.log("Modelo cargado correctamente.");
}

interface ArchetypeMatch {
  id: string;
  score: number;
  metadata?: {
    archetype?: string;
    description?: string;
  };
}

export const getJungianArchetypes = async (dreamText: string) => {
  try {
    // Cargar el modelo si aún no está cargado
    if (!model) await loadModel();

    // Generar embedding del texto
    const embedding = await model.embed(dreamText);
    const embeddingArray = Array.from(embedding.arraySync()[0]);

    // Acceder al índice de Pinecone
    const index = pinecone.Index(getEnvVariable("PINECONE_INDEX_NAME"));

    // Consultar Pinecone
    const queryResponse = await index.query({
      vector: embeddingArray,
      topK: 3,
      includeMetadata: true,
    });

    // Depuración: Imprime la respuesta completa de Pinecone
    console.log("Respuesta de Pinecone:", JSON.stringify(queryResponse, null, 2));

    // Verifica si matches existe y tiene elementos
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.warn("No se encontraron coincidencias en Pinecone.");
      return [];
    }

    // Mapear los resultados
    return (
      queryResponse.matches.map(
        (match: any): ArchetypeMatch => {
          console.log("Procesando match:", match); // Depuración: Imprime cada match
          return {
            id: match.id || "",
            score: match.score || 0,
            metadata: match.metadata && {
              archetype: match.metadata.archetype,
              description: match.metadata.description,
            },
          };
        }
      ) || []
    );
  } catch (error) {
    console.error("Error en pineconeService:", error);
    return [];
  }
};