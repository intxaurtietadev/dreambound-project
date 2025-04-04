import os
import torch
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv

# --- Configuración Inicial ---
load_dotenv()

EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
LLAMA_MODEL_NAME = os.getenv("LLAMA_MODEL_NAME", "mistralai/Mistral-7B-Instruct-v0.2")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
# *** LEER EL TOKEN DEL .ENV ***
HUGGING_FACE_TOKEN = os.getenv("HUGGING_FACE_TOKEN") # Lee el token añadido

if not PINECONE_API_KEY or not PINECONE_INDEX_NAME:
    raise ValueError("PINECONE_API_KEY y PINECONE_INDEX_NAME deben estar definidos en .env")
# *** AVISO SI FALTA EL TOKEN (aunque podría funcionar sin él si el login CLI fue suficiente) ***
if not HUGGING_FACE_TOKEN:
    print("ADVERTENCIA: HUGGING_FACE_TOKEN no encontrado en .env. Se intentará cargar el modelo sin token explícito.")


# --- Inicialización de Modelos y Servicios (Global) ---
print("Inicializando Flask...")
app = Flask(__name__)

# ... (Inicialización Pinecone igual que antes) ...
print(f"Inicializando Pinecone con índice: {PINECONE_INDEX_NAME}...")
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(PINECONE_INDEX_NAME)
    print("Pinecone inicializado correctamente.")
    print(index.describe_index_stats())
except Exception as e:
    print(f"Error inicializando Pinecone: {e}")
    index = None

# ... (Inicialización Embedding Model igual que antes) ...
print(f"Cargando modelo de embedding: {EMBEDDING_MODEL_NAME}...")
try:
    embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("Modelo de embedding cargado.")
except Exception as e:
    print(f"Error cargando modelo de embedding: {e}")
    embedding_model = None


print(f"Cargando modelo de generación Llama: {LLAMA_MODEL_NAME}...")
try:
    # *** PASAR EL TOKEN EXPLÍCITAMENTE ***
    tokenizer = AutoTokenizer.from_pretrained(
        LLAMA_MODEL_NAME,
        token=HUGGING_FACE_TOKEN # <-- Añadido
    )
    generation_model = AutoModelForCausalLM.from_pretrained(
        LLAMA_MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        token=HUGGING_FACE_TOKEN # <-- Añadido
    )
    print("Modelo de generación Llama cargado.")
except Exception as e:
    print(f"Error cargando modelo Llama: {e}")
    # Imprime más detalles del error si es posible
    if hasattr(e, 'response') and hasattr(e.response, 'text'):
         print(f"Detalles del error HTTP: {e.response.text}")
    tokenizer = None
    generation_model = None

# ... (Resto del código: Parámetros de generación, función get_relevant_archetypes, ruta /interpret-dream, ejecución del servidor) ...
# (El resto del código no necesita cambios)

# --- Parámetros de Generación ---
MAX_LENGTH_NEW_TOKENS = 1024
TEMPERATURE = 0.7
TOP_P = 0.9
NO_REPEAT_NGRAM_SIZE = 3

# --- Función para Consultar Pinecone ---
def get_relevant_archetypes(dream_text, top_k=3):
    if not index or not embedding_model:
        print("Error: Pinecone o modelo de embedding no inicializado.")
        return []
    try:
        print(f"Generando embedding para: '{dream_text[:50]}...'")
        embedding = embedding_model.encode(dream_text).tolist()
        print(f"Consultando Pinecone (índice: {PINECONE_INDEX_NAME}, top_k={top_k})...")
        results = index.query(vector=embedding, top_k=top_k, include_metadata=True)
        print("Resultados de Pinecone:", results)

        archetypes = []
        if results.matches:
            for match in results.matches:
                if match.metadata and 'archetype' in match.metadata and 'description' in match.metadata:
                    archetypes.append({
                        "archetype": match.metadata['archetype'],
                        "description": match.metadata['description'],
                        "score": match.score
                    })
                else:
                    print(f"Advertencia: Metadatos incompletos o faltantes para ID {match.id}")
        print(f"Arquetipos encontrados: {len(archetypes)}")
        return archetypes
    except Exception as e:
        print(f"Error consultando Pinecone: {e}")
        return []

# --- Ruta de Interpretación ---
@app.route('/interpret-dream', methods=['POST'])
def interpret_dream_route():
    global tokenizer, generation_model

    if not tokenizer or not generation_model:
        return jsonify({"error": "Modelo de generación Llama no cargado"}), 500
    if not index:
        return jsonify({"error": "Índice de Pinecone no disponible"}), 500
    if not embedding_model:
        return jsonify({"error": "Modelo de embedding no disponible"}), 500


    data = request.get_json()
    dream_text = data.get('dream_text', '')

    if not dream_text:
        return jsonify({"error": "No se proporcionó dream_text"}), 400

    print("\n--- Nueva Solicitud de Interpretación ---")
    print(f"Texto del sueño recibido: '{dream_text[:100]}...'")

    relevant_archetypes = get_relevant_archetypes(dream_text, top_k=3)

    archetypes_info = ""
    if relevant_archetypes:
        archetypes_info = "\nConsidera los siguientes arquetipos posiblemente relevantes basados en el análisis de similitud (puntuación más alta indica mayor relevancia):\n"
        for archetype in relevant_archetypes:
            archetypes_info += f"- {archetype.get('archetype')} (Relevancia: {archetype.get('score', 0):.2f}): {archetype.get('description')}\n"
    else:
        archetypes_info = "\nNo se encontraron arquetipos específicos altamente relevantes mediante análisis de similitud, realiza una interpretación general basada en símbolos y emociones presentes.\n"

    prompt = f"""Eres un experto en psicología junguiana especializado en interpretación de sueños. Analiza el siguiente sueño desde una perspectiva junguiana profunda. Considera los símbolos presentes, las emociones expresadas y los posibles arquetipos implicados. Si se proporcionan arquetipos relevantes, intégralos en tu análisis, explicando cómo podrían manifestarse en el sueño. Ofrece una interpretación detallada y reflexiva, conectando los elementos del sueño con los procesos de individuación, la sombra, el anima/animus, y otros conceptos junguianos pertinentes. Evita respuestas genéricas.

Sueño a interpretar:
"{dream_text}"
{archetypes_info}
Interpretación Junguiana Detallada:"""

    # --- Línea corregida ---
    # Ahora está indentada correctamente DENTRO de la función interpret_dream_route
    print(f"\nPrompt enviado al modelo Llama:\n{prompt}\n")

    try:
        # --- Generación ---
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(generation_model.device)

        print("Generando interpretación...")
        with torch.no_grad():
            outputs = generation_model.generate(
                **inputs,
                max_new_tokens=MAX_LENGTH_NEW_TOKENS,
                temperature=TEMPERATURE,
                top_p=TOP_P,
                do_sample=True,
                no_repeat_ngram_size=NO_REPEAT_NGRAM_SIZE,
                pad_token_id=tokenizer.eos_token_id
            )

        interpretation = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        interpretation = interpretation.strip()
        print(f"\nInterpretación generada:\n{interpretation}")

        return jsonify({
            "interpretation": interpretation,
            "archetypes_found": relevant_archetypes,
            "status": "success"
        })

    except Exception as e:
        print(f"Error durante la generación con Llama: {e}")
        return jsonify({"error": f"Error generando la interpretación: {e}"}), 500

# ... (resto del código de ejecución del servidor igual) ...

# --- Ejecución del Servidor ---
if __name__ == '__main__':
    if embedding_model and index and tokenizer and generation_model:
        print("Modelos y Pinecone listos. Iniciando servidor Flask...")
        app.run(host='0.0.0.0', port=5001, debug=True)
    else:
        print("Error: No se pudieron cargar todos los modelos o conectar a Pinecone. El servidor no se iniciará.")

