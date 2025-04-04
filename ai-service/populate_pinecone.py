# dreambound-project-main/ai-service/populate_pinecone.py
# (Basado y modificado desde query_jungian_concepts.py)

import os
import time
from pinecone import Pinecone, ServerlessSpec # O PodSpec si usas pods
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import re # Para extraer nombre de arquetipo

# --- Configuración ---
load_dotenv() # Carga variables desde .env en la carpeta ai-service
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME") # El mismo que usa llama_service.py
EMBEDDING_MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'
DIMENSION = 384 # Dimensión para all-MiniLM-L6-v2

# --- Configuración para Pinecone Serverless (ajusta si usas Pods) ---
# Revisa tu configuración de Pinecone para asegurarte que coinciden
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")
# Si usas Pods, necesitarías:
# PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT") # ej: "gcp-starter", "us-west1-gcp"

# Validar configuración
if not PINECONE_API_KEY or not PINECONE_INDEX_NAME:
    raise ValueError("PINECONE_API_KEY y PINECONE_INDEX_NAME deben estar definidos en .env")

# --- Conceptos Junguianos con Metadatos ---
# Revisa y refina los campos 'archetype' y 'description' según necesites.
# He intentado inferirlos, pero puedes hacerlos más específicos.
original_jungian_concepts = [
    {"id": "archetype_hero", "text": "The Hero: Represents the journey of self-discovery and transformation, often facing challenges that lead to personal growth."},
    {"id": "archetype_shadow", "text": "The Shadow: Represents the unconscious part of the psyche, containing repressed weaknesses, desires, and instincts."},
    {"id": "archetype_anima_animus", "text": "The Anima/Animus: Represents the inner feminine/masculine. The Anima is the feminine aspect in a man's unconscious, while the Animus is the masculine aspect in a woman's unconscious."},
    {"id": "archetype_self", "text": "The Self: Represents the totality of the psyche, symbolizing the integration of all aspects of the conscious and unconscious mind."},
    {"id": "archetype_persona", "text": "The Persona: The social mask we wear in everyday life, representing the aspects of our personality that are presented to the outside world."},
    {"id": "archetype_wise_old_man", "text": "The Wise Old Man: Represents wisdom, guidance, and insight. This archetype often appears as a mentor or guide."},
    {"id": "archetype_great_mother", "text": "The Great Mother: Symbolizes nurturing, protection, and growth, but also the devouring and destructive aspects of the feminine."},
    {"id": "archetype_trickster", "text": "The Trickster: Represents mischief, breaking societal rules, and causing chaos for the sake of transformation."},
    {"id": "journey_hero", "text": "The Hero's Journey: The archetypal path of transformation, self-discovery, and growth that leads to individuation."},
    {"id": "duality_anima_animus", "text": "The Anima/Animus: Represents the inner feminine and masculine energies, facilitating a balance between opposing psychological traits."}, # ID duplicado conceptualmente, renombrado
    {"id": "concept_shadow_growth", "text": "The Shadow: Contains repressed aspects of our psyche, offering opportunities for growth when we confront it."}, # ID duplicado conceptualmente, renombrado
    {"id": "concept_self_integration", "text": "The Self: Symbolizes integration and wholeness, representing the entire personality and unity between the conscious and unconscious."}, # ID duplicado conceptualmente, renombrado
    {"id": "concept_collective_unconscious", "text": "The Collective Unconscious: The deep layer of the unconscious mind shared by all humanity, filled with universal archetypes and experiences."},
    {"id": "concept_personal_unconscious", "text": "The Personal Unconscious: Contains repressed memories, experiences, and complexes unique to the individual."},
    {"id": "concept_complex", "text": "The Complex: A set of repressed emotions and memories that are often emotionally charged and can influence behavior."},
    {"id": "concept_symbol", "text": "The Symbol: A representation of deeper, unconscious meanings, often connected to personal and collective experiences."},
    {"id": "symbol_mandala", "text": "The Mandala: A symbol of wholeness and inner order, representing the process of individuation and psychological balance."},
    {"id": "symbol_dragon", "text": "The Dragon: Represents fear, the shadow, and the need for transformation, often encountered on the journey of individuation."},
    {"id": "symbol_ring", "text": "The Ring: Symbolizes wholeness, completeness, and the connection to the infinite, often seen as a symbol of unity."},
    {"id": "symbol_water", "text": "Water: Symbolizes the unconscious, emotions, intuition, and the process of transformation and rebirth."},
    {"id": "symbol_forest", "text": "The Forest: Represents the unknown, mystery, and the encounter with the unconscious, often symbolizing the journey into the self."},
    {"id": "symbol_mountain", "text": "The Mountain: Symbolizes spiritual achievement, enlightenment, and the quest for connection with the Self."},
    {"id": "symbol_spiral", "text": "The Spiral: Represents evolution, cycles of change, and spiritual growth, often symbolizing the process of individuation."},
    {"id": "symbol_labyrinth", "text": "The Labyrinth: Symbolizes the search for knowledge, personal transformation, and the challenges of the unconscious mind."},
    {"id": "symbol_serpent", "text": "The Serpent: Represents transformation, rebirth, and vital energy, often symbolizing the awakening of unconscious forces."},
    {"id": "symbol_sun_moon", "text": "The Sun and the Moon: The Sun represents consciousness, reason, and masculinity, while the Moon symbolizes the unconscious, intuition, and femininity."},
    {"id": "symbol_mirror", "text": "The Mirror: Symbolizes self-reflection, truth, and the need to confront the unconscious aspects of the self."},
    {"id": "archetype_inner_child", "text": "The Inner Child: Represents innocence, creativity, and spontaneity, often embodying the untapped potential of the psyche."},
    {"id": "archetype_warrior", "text": "The Warrior: Symbolizes the internal and external struggle for truth, personal integrity, and transformation."},
    {"id": "archetype_orphan", "text": "The Orphan: Represents vulnerability, the longing for connection, and the desire to find belonging in the world."},
    {"id": "archetype_king_queen", "text": "The King and Queen: Represent authority, wisdom, and inner order, embodying the archetype of leadership and governance."},
    {"id": "symbol_desert", "text": "The Desert: Symbolizes trials, introspection, and the search for meaning, often representing periods of isolation or personal growth."},
    {"id": "symbol_phoenix", "text": "The Phoenix: Represents death and rebirth, symbolizing profound transformation and the ability to rise from the ashes."},
    {"id": "symbol_skeleton_death", "text": "The Skeleton or Death: Represents the end of a cycle and psychological rebirth, symbolizing the need for personal renewal."},
    {"id": "symbol_ship_navigation", "text": "The Ship or Navigation: Symbolizes the soul’s journey and the exploration of the unconscious mind."},
    {"id": "symbol_bridge", "text": "The Bridge: Represents transition and connection between the conscious and unconscious, often symbolizing an important psychological shift."},
    {"id": "symbol_river", "text": "The River: Symbolizes the flow of life, transformation, and transitions between different states of consciousness."},
    {"id": "symbol_horse", "text": "The Horse: Represents instinctive energy, freedom, and unconscious power, often symbolizing the drive towards individuation."},
    {"id": "symbol_lion", "text": "The Lion: Symbolizes strength, self-mastery, and courage in individuation, often appearing as a protector or guide."},
    {"id": "symbol_tree_of_life", "text": "The Tree of Life: Represents growth, wisdom, and the connection to the collective unconscious, symbolizing the interconnectedness of all things."},
    {"id": "symbol_doorway", "text": "The Doorway: Symbolizes new beginnings, access to deeper knowledge, and the crossing of thresholds in the journey of individuation."},
    {"id": "symbol_cave", "text": "The Cave: Represents deep introspection, solitude, and the confrontation with unconscious fears and desires."},
    {"id": "symbol_twin", "text": "The Twin: Represents duality, inner conflict, and the integration of opposites, often symbolizing the balance between contrasting forces."},
    {"id": "symbol_tower", "text": "The Tower: Symbolizes the ego’s structure, the potential isolation from the unconscious, and the need for deconstruction."},
    {"id": "symbol_mask", "text": "The Mask: Represents the different facets of the self, the hidden and the revealed, often signifying the persona we project to others."},
    {"id": "archetype_wounded_healer", "text": "The Wounded Healer: Represents the ability to heal others through personal suffering, often symbolizing the transformative power of vulnerability."},
    {"id": "archetype_sacrificial_victim", "text": "The Sacrificial Victim: Symbolizes the need to let go for transformation and renewal, representing the willingness to make personal sacrifices."},
    {"id": "symbol_cosmic_egg", "text": "The Cosmic Egg: A symbol of potential, creation, and the birth of new consciousness, representing the primordial state of being."},
    {"id": "symbol_philosophers_stone", "text": "The Philosopher's Stone: Symbolizes transformation, enlightenment, and the ultimate wisdom attained through individuation."},
    {"id": "symbol_black_sun", "text": "The Black Sun (Sol Niger): Represents deep psychological transformation and the dissolution of the ego, symbolizing the process of inner alchemy."},
    {"id": "symbol_ouroboros", "text": "The Ouroboros: The snake eating its own tail, symbolizing eternity, cycles, and self-renewal, often appearing as a symbol of unity and wholeness."},
    {"id": "process_alchemy", "text": "The Alchemical Process: Represents the psychological stages of transformation (Nigredo, Albedo, Rubedo), symbolizing the purification and integration of the self."},
    {"id": "archetype_trickster_god", "text": "The Trickster God: A more divine form of the trickster, associated with chaos, change, and the possibility of spiritual rebirth."},
    {"id": "symbol_world_tree", "text": "The World Tree: Symbolizing the axis mundi, the connection between the underworld, middle world, and heavens, representing spiritual growth and integration."},
    {"id": "symbol_cosmic_ocean", "text": "The Cosmic Ocean: Represents the vast unconscious, primal forces, and spiritual awakening, symbolizing the universal consciousness."},
]

def generate_metadata(concept_data):
    """Genera metadatos básicos. ¡Revisar y mejorar!"""
    # Intenta extraer un nombre legible del ID
    match = re.match(r"^(archetype|symbol|concept|process|journey|duality)_(.*)", concept_data["id"])
    archetype_name = "Unknown"
    if match:
        # Convierte 'inner_child' a 'Inner Child'
        archetype_name = match.group(2).replace('_', ' ').title()
    # Descripción corta (primeros ~100 caracteres antes de un punto)
    description = concept_data["text"]
    first_sentence_end = description.find('.')
    if first_sentence_end != -1 and first_sentence_end < 100:
        description = description[:first_sentence_end + 1]
    else:
        description = description[:100] + ('...' if len(description) > 100 else '')

    return {
        "archetype": archetype_name,
        "description": description,
        "original_text": concept_data["text"] # Guardamos el texto original
    }

# --- Lógica Principal de Indexación ---
if __name__ == "__main__":
    print("--- Iniciando Script de Indexación Pinecone ---")
    print(f"Usando índice: {PINECONE_INDEX_NAME}")
    print(f"Usando modelo: {EMBEDDING_MODEL_NAME} (Dimensión: {DIMENSION})")

    try:
        # 1. Inicializar Pinecone
        print("Inicializando cliente Pinecone...")
        pc = Pinecone(api_key=PINECONE_API_KEY)
        print("Cliente Pinecone inicializado.")

        # 2. Comprobar/Crear Índice
        index_list = pc.list_indexes()
        existing_indexes = [index_info.name for index_info in index_list]
        if PINECONE_INDEX_NAME not in existing_indexes:
            print(f"Índice '{PINECONE_INDEX_NAME}' no encontrado. Creándolo...")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=DIMENSION,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud=PINECONE_CLOUD,
                    region=PINECONE_REGION
                )
                 # O si usas Pods:
                 # spec=PodSpec(environment=PINECONE_ENVIRONMENT)
            )
            print(f"Índice '{PINECONE_INDEX_NAME}' creado. Esperando a que esté listo...")
            # Esperar un poco a que el índice esté completamente listo (puede tardar)
            while not pc.describe_index(PINECONE_INDEX_NAME).status['ready']:
                time.sleep(5)
            print("Índice listo.")
        else:
            print(f"Índice '{PINECONE_INDEX_NAME}' ya existe.")

        # 3. Conectar al Índice
        index = pc.Index(PINECONE_INDEX_NAME)
        print("Conectado al índice.")
        print("Estadísticas actuales del índice:")
        print(index.describe_index_stats())

        # 4. Cargar Modelo de Embedding
        print(f"Cargando modelo de embedding: {EMBEDDING_MODEL_NAME}...")
        model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        print("Modelo cargado.")

        # 5. Preparar Vectores para Upsert
        vectors_to_upsert = []
        print("Generando embeddings y metadatos para los conceptos...")
        for concept in original_jungian_concepts:
            text = concept["text"]
            vector_id = concept["id"]
            embedding = model.encode(text).tolist()
            metadata = generate_metadata(concept) # Generar metadatos básicos

            if not metadata.get("archetype") or not metadata.get("description"):
                print(f"ADVERTENCIA: Metadatos generados incompletos para id '{vector_id}'")

            vectors_to_upsert.append((vector_id, embedding, metadata))
            # print(f"  Preparado vector para ID: {vector_id}") # Descomentar para mucho detalle

        # 6. Realizar Upsert en Lotes (Pinecone client maneja esto internamente)
        if vectors_to_upsert:
            print(f"\nEnviando {len(vectors_to_upsert)} vectores al índice '{PINECONE_INDEX_NAME}'...")
             # Puedes dividir en lotes más pequeños si encuentras timeouts
             # batch_size = 100
             # for i in range(0, len(vectors_to_upsert), batch_size):
             #    batch = vectors_to_upsert[i:i + batch_size]
             #    print(f"  Enviando lote {i//batch_size + 1}...")
             #    upsert_response = index.upsert(vectors=batch)
             #    print(f"  Respuesta Upsert Lote: {upsert_response}")
            upsert_response = index.upsert(vectors=vectors_to_upsert)
            print(f"Respuesta final de Pinecone upsert: {upsert_response}")
            print("¡Indexación completada!")
            print("\nEstadísticas del índice después de la indexación:")
            print(index.describe_index_stats())
        else:
            print("No hay vectores para indexar.")

    except Exception as e:
        print(f"\n--- ERROR DURANTE LA INDEXACIÓN ---")
        print(e)
        import traceback
        traceback.print_exc()

    print("\n--- Script de Indexación Finalizado ---")