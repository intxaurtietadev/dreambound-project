import os
from flask import Flask, request, jsonify
# ---- NUEVO IMPORT para CORS ----
from flask_cors import CORS
# ------------------------------
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from llama_cpp import Llama
from dotenv import load_dotenv
import traceback

# --- Configuración Inicial ---
load_dotenv()

EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
# ---- RUTA AL MODELO GGUF DESCARGADO ----
LLAMA_GGUF_MODEL_PATH = "./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"


PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

if not PINECONE_API_KEY or not PINECONE_INDEX_NAME:
    raise ValueError("PINECONE_API_KEY y PINECONE_INDEX_NAME deben estar definidos en .env")
if not os.path.exists(LLAMA_GGUF_MODEL_PATH):
     raise ValueError(f"No se encuentra el archivo del modelo GGUF en la ruta: {LLAMA_GGUF_MODEL_PATH}")

# --- Inicialización ---
print("Inicializando Flask...")
app = Flask(__name__)
# ---- HABILITAR CORS ----
# Permite peticiones específicamente desde frontend
CORS(app, origins="http://localhost:5173")

print("CORS habilitado para http://localhost:5173")


print(f"Inicializando Pinecone con índice: {PINECONE_INDEX_NAME}...")
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX_NAME)
    print("Pinecone inicializado correctamente.")
    try:
        print(index.describe_index_stats())
    except Exception as pinecone_stat_err:
        print(f"Advertencia: No se pudieron obtener stats de Pinecone: {pinecone_stat_err}")
except Exception as e:
    print(f"Error inicializando Pinecone: {e}")
    index = None

print(f"Cargando modelo de embedding: {EMBEDDING_MODEL_NAME}...")
try:
    embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("Modelo de embedding cargado.")
except Exception as e:
    print(f"Error cargando modelo de embedding: {e}")
    embedding_model = None

print(f"Cargando modelo GGUF desde: {LLAMA_GGUF_MODEL_PATH}...")
llm = None
try:
    llm = Llama(
        model_path=LLAMA_GGUF_MODEL_PATH,
        n_ctx=4096,
        n_gpu_layers=0, # CPU only
        verbose=True
    )
    print("Modelo GGUF cargado con llama-cpp-python.")
except Exception as e:
    print(f"Error cargando modelo GGUF con llama-cpp-python: {e}")


# --- Parámetros de Generación ---
MAX_LENGTH_NEW_TOKENS = 512
TEMPERATURE = 0.7
TOP_P = 0.9
REPEAT_PENALTY = 1.1

# --- Función para Consultar Pinecone ---
def get_relevant_archetypes(dream_text, top_k=3):
    if not index or not embedding_model:
        print("Error: Pinecone or embedding model not initialized.")
        return []
    try:
        print(f"Generating embedding for: '{dream_text[:50]}...'")
        embedding = embedding_model.encode(dream_text).tolist()
        print(f"Querying Pinecone (index: {PINECONE_INDEX_NAME}, top_k={top_k})...")
        results = index.query(vector=embedding, top_k=top_k, include_metadata=True)
        print("Raw Pinecone results:", results)

        archetypes = []
        if results and results.matches:
            for match in results.matches:
                if hasattr(match, 'metadata') and match.metadata and \
                'archetype' in match.metadata and 'description' in match.metadata:
                    archetypes.append({
                        "archetype": match.metadata.get('archetype', 'Unknown'),
                        "description": match.metadata.get('description', 'No description'),
                        "score": match.score if hasattr(match, 'score') else 0.0
                    })
                else:
                    match_id = match.id if hasattr(match, 'id') else 'Unknown'
                    print(f"Warning: Incomplete or missing metadata for ID {match_id}")
        else:
            print("Warning: Pinecone response does not contain 'matches' or is empty.")

        print(f"Valid archetypes found: {len(archetypes)}")
        return archetypes
    except Exception as e:
        print(f"Error querying Pinecone: {e}")
        return []

# --- Ruta de Interpretación ---
@app.route('/interpret-dream', methods=['POST'])
def interpret_dream_route():
    global llm, index, embedding_model

    if llm is None:
        return jsonify({"error": "Modelo de generación GGUF no cargado"}), 500
    if not index:
        return jsonify({"error": "Pinecone index not available"}), 500
    if not embedding_model:
        return jsonify({"error": "Embedding model not available"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    dream_text = data.get('dream_text', '')

    if not dream_text:
        return jsonify({"error": "dream_text not provided"}), 400

    print("\n--- New Interpretation Request ---")
    print(f"Received dream text: '{dream_text[:100]}...'")

    relevant_archetypes = get_relevant_archetypes(dream_text, top_k=3)

    archetypes_info = ""
    if relevant_archetypes:
        archetypes_info = "\nConsider the following archetypes possibly relevant based on similarity analysis (higher score means higher relevance):\n"
        for archetype in relevant_archetypes:
            archetypes_info += f"- {archetype.get('archetype')} (Relevance: {archetype.get('score', 0):.2f}): {archetype.get('description')}\n"
    else:
        archetypes_info = "\nNo specific highly relevant archetypes were found via similarity analysis. Perform a general interpretation based on symbols and emotions present.\n"

    prompt = f"""You are an expert in Jungian psychology specializing in dream interpretation. Analyze the following dream from a deep Jungian perspective. Consider the symbols present, the emotions expressed, and the possible archetypes involved. If relevant archetypes are provided, integrate them into your analysis, explaining how they might manifest in the dream. Offer a detailed and thoughtful interpretation, connecting the dream elements with the processes of individuation, the shadow, the anima/animus, and other pertinent Jungian concepts. Avoid generic answers.

Dream to interpret:
"{dream_text}"

{archetypes_info}
Detailed Jungian Interpretation:"""

    print(f"\nPrompt sent to llama-cpp model:\n{prompt}\n")
    try:
        print(f"Generating interpretation (max {MAX_LENGTH_NEW_TOKENS} tokens)...")

        output = llm(
            prompt,
            max_tokens=MAX_LENGTH_NEW_TOKENS,
            temperature=TEMPERATURE,
            top_p=TOP_P,
            repeat_penalty=REPEAT_PENALTY,
            stop=["\nSueño a interpretar:", "\nDream to interpret:"],
            echo=False
        )

        interpretation = output['choices'][0]['text'].strip()

        print(f"\nGenerated interpretation:\n{interpretation}")

        return jsonify({
            "interpretation": interpretation,
            "archetypes_found": relevant_archetypes,
            "status": "success"
        })

    except Exception as e:
        print(f"Error during generation with llama-cpp:")
        traceback.print_exc()
        return jsonify({"error": f"Error generating interpretation: {str(e)}"}), 500


# --- Ejecución del Servidor ---
if __name__ == '__main__':
    if embedding_model and index and llm:
        print("Models (Embedding, GGUF) and Pinecone ready. Starting Flask server...")
        # Asegúrate de tener Flask-Cors instalado: pip install Flask-Cors
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("Error: Could not load embedding model, GGUF model, or connect to Pinecone. Server will not start.")