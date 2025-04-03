from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "dreambound"

# Check if index exists, if not, create it
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name, 
        dimension=1024,  # 1024 dimensiones para 'llama-text-embed-v2dreambound'
        metric='cosine',
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'  # Región soportada
        )
    )

# Connect to the existing index
index = pc.Index(index_name)

# Cargar el modelo adecuado, en caso de que tengas uno de 1024 dimensiones
# Este es un ejemplo de cómo cargar el modelo correcto
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")  # Cambia esto por el nombre real de tu modelo

# Lista de conceptos jungianos de ejemplo
jungian_concepts = [
    {"id": "archetype_1", "text": "The Hero archetype represents the journey of self-discovery."},
    {"id": "archetype_2", "text": "The Shadow represents the unconscious part of the psyche."},
    {"id": "archetype_3", "text": "The Anima/Animus represents the inner feminine/masculine."},
    {"id": "archetype_4", "text": "The Self represents the totality of the psyche."},
]

# Convertir los textos de los conceptos en embeddings
embeddings = [model.encode(concept["text"]).tolist() for concept in jungian_concepts]

# Indexar los conceptos en Pinecone
index.upsert(vectors=list(zip([concept["id"] for concept in jungian_concepts], embeddings)))
print("Concepts indexed successfully!")

def retrieve_jungian_concepts(dream_text, top_k=5):
    """Retrieve the most relevant Jungian concepts for a given dream."""
    embedding = model.encode(dream_text).tolist()
    
    # Query Pinecone index
    results = index.query(vector=embedding, top_k=top_k, include_metadata=True)
    
    # Extract relevant concepts
    concepts = [match["id"] for match in results["matches"]]
    return concepts

# Example usage
if __name__ == "__main__":
# Probar con un sueño más relacionado
    dream_input = "I am discovering my inner self, going through trials and embracing my shadow."
    related_concepts = retrieve_jungian_concepts(dream_input)
    print("Relevant Jungian Concepts:", related_concepts)

