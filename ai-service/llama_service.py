# llama_service.py
# --- VERSIÓN con google/flan-t5-small Y PROMPT EN INGLÉS ---

import os
import torch
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from dotenv import load_dotenv

# --- Configuración Inicial ---
load_dotenv()

EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
LLAMA_MODEL_NAME = "google/flan-t5-small" # Mantenemos flan-t5-small

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
HUGGING_FACE_TOKEN = os.getenv("HUGGING_FACE_TOKEN")

if not PINECONE_API_KEY or not PINECONE_INDEX_NAME:
    raise ValueError("PINECONE_API_KEY y PINECONE_INDEX_NAME deben estar definidos en .env")

# --- Inicialización de Modelos y Servicios (Global) ---
print("Inicializando Flask...")
app = Flask(__name__)

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

print(f"Cargando modelo de generación: {LLAMA_MODEL_NAME}...")
try:
    tokenizer = AutoTokenizer.from_pretrained(LLAMA_MODEL_NAME)
    generation_model = AutoModelForSeq2SeqLM.from_pretrained(LLAMA_MODEL_NAME)
    print("Modelo de generación cargado.")
except Exception as e:
    print(f"Error cargando modelo de generación: {e}")
    if hasattr(e, 'response') and hasattr(e.response, 'text'):
        print(f"Detalles del error HTTP: {e.response.text}")
    tokenizer = None
    generation_model = None


# --- Parámetros de Generación ---
MAX_LENGTH_NEW_TOKENS = 256
TEMPERATURE = 0.7
TOP_P = 0.9
REPETITION_PENALTY=1.2

# --- Función para Consultar Pinecone (Sin cambios) ---
def get_relevant_archetypes(dream_text, top_k=3):
    if not index or not embedding_model:
        print("Error: Pinecone o modelo de embedding no inicializado.")
        return []
    try:
        print(f"Generando embedding para: '{dream_text[:50]}...'")
        # IMPORTANTE: Asumimos que el embedding funciona bien para inglés/español
        # all-MiniLM-L6-v2 es multilingüe, pero funciona mejor si el idioma es consistente.
        # Si el dream_text viene del usuario en español, el embedding será en 'español'.
        # Si los arquetipos en Pinecone están descritos/indexados en inglés,
        # la búsqueda de similitud podría no ser óptima.
        # Considera traducir el dream_text a inglés ANTES de generar el embedding si es necesario.
        embedding = embedding_model.encode(dream_text).tolist()
        print(f"Consultando Pinecone (índice: {PINECONE_INDEX_NAME}, top_k={top_k})...")
        results = index.query(vector=embedding, top_k=top_k, include_metadata=True)
        print("Resultados crudos de Pinecone:", results)

        archetypes = []
        if results and results.matches:
            for match in results.matches:
                if hasattr(match, 'metadata') and match.metadata and \
                'archetype' in match.metadata and 'description' in match.metadata:
                    archetypes.append({
                        "archetype": match.metadata.get('archetype', 'Unknown'), # <-- Traducido
                        "description": match.metadata.get('description', 'No description'), # <-- Traducido
                        "score": match.score if hasattr(match, 'score') else 0.0
                    })
                else:
                    match_id = match.id if hasattr(match, 'id') else 'Unknown' # <-- Traducido
                    print(f"Warning: Incomplete or missing metadata for ID {match_id}") # <-- Traducido
        else:
            print("Warning: Pinecone response does not contain 'matches' or is empty.") # <-- Traducido

        print(f"Valid archetypes found: {len(archetypes)}") # <-- Traducido
        return archetypes
    except Exception as e:
        print(f"Error querying Pinecone: {e}") # <-- Traducido
        return []


# --- Ruta de Interpretación ---
@app.route('/interpret-dream', methods=['POST'])
def interpret_dream_route():
    global tokenizer, generation_model, index, embedding_model

    # Validaciones iniciales (mensajes en inglés ahora)
    if not tokenizer or not generation_model:
        return jsonify({"error": "Generation model not loaded"}), 500
    if not index:
        return jsonify({"error": "Pinecone index not available"}), 500
    if not embedding_model:
        return jsonify({"error": "Embedding model not available"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    dream_text = data.get('dream_text', '') # Asumimos que el usuario escribe el sueño en cualquier idioma

    if not dream_text:
        return jsonify({"error": "dream_text not provided"}), 400

    print("\n--- New Interpretation Request ---") # <-- Traducido
    print(f"Received dream text: '{dream_text[:100]}...'") # <-- Traducido

    # NOTA: get_relevant_archetypes usará el idioma original del dream_text para el embedding
    relevant_archetypes = get_relevant_archetypes(dream_text, top_k=3)

    archetypes_info = ""
    # La descripción de arquetipos viene de Pinecone, asumimos que está en inglés o el idioma deseado
    if relevant_archetypes:
        archetypes_info = "\nConsider the following archetypes possibly relevant based on similarity analysis (higher score means higher relevance):\n" # <-- Traducido
        for archetype in relevant_archetypes:
            # Asegúrate que la descripción del arquetipo en Pinecone esté en inglés si quieres que se integre bien
            archetypes_info += f"- {archetype.get('archetype')} (Relevance: {archetype.get('score', 0):.2f}): {archetype.get('description')}\n"
    else:
        archetypes_info = "\nNo specific highly relevant archetypes were found via similarity analysis. Perform a general interpretation based on symbols and emotions present.\n" # <-- Traducido

    # ---- CAMBIO 4: Prompt en Inglés ----
    prompt = f"""You are an expert in Jungian psychology specializing in dream interpretation. Analyze the following dream from a deep Jungian perspective. Consider the symbols present, the emotions expressed, and the possible archetypes involved. If relevant archetypes are provided, integrate them into your analysis, explaining how they might manifest in the dream. Offer a detailed and thoughtful interpretation, connecting the dream elements with the processes of individuation, the shadow, the anima/animus, and other pertinent Jungian concepts. Avoid generic answers.

Dream to interpret:
"{dream_text}"

{archetypes_info}
Detailed Jungian Interpretation:"""
    # ----------------------------------

    print(f"\nPrompt sent to model ({LLAMA_MODEL_NAME}):\n{prompt}\n") # <-- Traducido

    try:
        if tokenizer is None or generation_model is None:
            raise Exception("Tokenizer or Model not initialized")

        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)

        print(f"Generating interpretation (max {MAX_LENGTH_NEW_TOKENS} tokens)...") # <-- Traducido
        with torch.no_grad():
            outputs = generation_model.generate(
                **inputs,
                max_new_tokens=MAX_LENGTH_NEW_TOKENS,
                temperature=TEMPERATURE,
                top_p=TOP_P,
                do_sample=True,
                repetition_penalty=REPETITION_PENALTY
            )

        interpretation = tokenizer.decode(outputs[0], skip_special_tokens=True)
        interpretation = interpretation.strip()
        # Log en inglés
        print(f"\nGenerated interpretation:\n{interpretation}")

        # Respuesta JSON sin cambios en estructura
        return jsonify({
            "interpretation": interpretation,
            "archetypes_found": relevant_archetypes,
            "status": "success"
        })

    except Exception as e:
        import traceback
        # Log en inglés
        print(f"Error during generation with {LLAMA_MODEL_NAME}:")
        traceback.print_exc()
        # Mensaje de error en inglés
        return jsonify({"error": f"Error generating interpretation: {str(e)}"}), 500


# --- Ejecución del Servidor ---
if __name__ == '__main__':
    if embedding_model and index and tokenizer and generation_model:
        # Mensaje en inglés
        print("Models and Pinecone ready. Starting Flask server...")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        # Mensaje en inglés
        print("Error: Could not load all models or connect to Pinecone. Server will not start.")