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
    {"id": "archetype_1", "text": "The Hero: Represents the journey of self-discovery and transformation, often facing challenges that lead to personal growth."},
    {"id": "archetype_2", "text": "The Shadow: Represents the unconscious part of the psyche, containing repressed weaknesses, desires, and instincts."},
    {"id": "archetype_3", "text": "The Anima/Animus: Represents the inner feminine/masculine. The Anima is the feminine aspect in a man's unconscious, while the Animus is the masculine aspect in a woman's unconscious."},
    {"id": "archetype_4", "text": "The Self: Represents the totality of the psyche, symbolizing the integration of all aspects of the conscious and unconscious mind."},
    {"id": "archetype_5", "text": "The Persona: The social mask we wear in everyday life, representing the aspects of our personality that are presented to the outside world."},
    {"id": "archetype_6", "text": "The Wise Old Man: Represents wisdom, guidance, and insight. This archetype often appears as a mentor or guide."},
    {"id": "archetype_7", "text": "The Great Mother: Symbolizes nurturing, protection, and growth, but also the devouring and destructive aspects of the feminine."},
    {"id": "archetype_8", "text": "The Trickster: Represents mischief, breaking societal rules, and causing chaos for the sake of transformation."},
    {"id": "archetype_9", "text": "The Hero's Journey: The archetypal path of transformation, self-discovery, and growth that leads to individuation."},
    {"id": "archetype_10", "text": "The Anima/Animus: Represents the inner feminine and masculine energies, facilitating a balance between opposing psychological traits."},
    {"id": "archetype_11", "text": "The Shadow: Contains repressed aspects of our psyche, offering opportunities for growth when we confront it."},
    {"id": "archetype_12", "text": "The Self: Symbolizes integration and wholeness, representing the entire personality and unity between the conscious and unconscious."},
    {"id": "archetype_13", "text": "The Collective Unconscious: The deep layer of the unconscious mind shared by all humanity, filled with universal archetypes and experiences."},
    {"id": "archetype_14", "text": "The Personal Unconscious: Contains repressed memories, experiences, and complexes unique to the individual."},
    {"id": "archetype_15", "text": "The Complex: A set of repressed emotions and memories that are often emotionally charged and can influence behavior."},
    {"id": "archetype_16", "text": "The Symbol: A representation of deeper, unconscious meanings, often connected to personal and collective experiences."},
    {"id": "archetype_17", "text": "The Mandala: A symbol of wholeness and inner order, representing the process of individuation and psychological balance."},
    {"id": "archetype_18", "text": "The Dragon: Represents fear, the shadow, and the need for transformation, often encountered on the journey of individuation."},
    {"id": "archetype_19", "text": "The Ring: Symbolizes wholeness, completeness, and the connection to the infinite, often seen as a symbol of unity."},
    {"id": "archetype_20", "text": "Water: Symbolizes the unconscious, emotions, intuition, and the process of transformation and rebirth."},
    {"id": "archetype_21", "text": "The Forest: Represents the unknown, mystery, and the encounter with the unconscious, often symbolizing the journey into the self."},
    {"id": "archetype_22", "text": "The Mountain: Symbolizes spiritual achievement, enlightenment, and the quest for connection with the Self."},
    {"id": "archetype_23", "text": "The Spiral: Represents evolution, cycles of change, and spiritual growth, often symbolizing the process of individuation."},
    {"id": "archetype_24", "text": "The Labyrinth: Symbolizes the search for knowledge, personal transformation, and the challenges of the unconscious mind."},
    {"id": "archetype_25", "text": "The Serpent: Represents transformation, rebirth, and vital energy, often symbolizing the awakening of unconscious forces."},
    {"id": "archetype_26", "text": "The Sun and the Moon: The Sun represents consciousness, reason, and masculinity, while the Moon symbolizes the unconscious, intuition, and femininity."},
    {"id": "archetype_27", "text": "The Mirror: Symbolizes self-reflection, truth, and the need to confront the unconscious aspects of the self."},
    {"id": "archetype_28", "text": "The Inner Child: Represents innocence, creativity, and spontaneity, often embodying the untapped potential of the psyche."},
    {"id": "archetype_29", "text": "The Warrior: Symbolizes the internal and external struggle for truth, personal integrity, and transformation."},
    {"id": "archetype_30", "text": "The Orphan: Represents vulnerability, the longing for connection, and the desire to find belonging in the world."},
    {"id": "archetype_31", "text": "The King and Queen: Represent authority, wisdom, and inner order, embodying the archetype of leadership and governance."},
    {"id": "archetype_32", "text": "The Desert: Symbolizes trials, introspection, and the search for meaning, often representing periods of isolation or personal growth."},
    {"id": "archetype_33", "text": "The Phoenix: Represents death and rebirth, symbolizing profound transformation and the ability to rise from the ashes."},
    {"id": "archetype_34", "text": "The Skeleton or Death: Represents the end of a cycle and psychological rebirth, symbolizing the need for personal renewal."},
    {"id": "archetype_35", "text": "The Ship or Navigation: Symbolizes the soul’s journey and the exploration of the unconscious mind."},
    {"id": "archetype_36", "text": "The Bridge: Represents transition and connection between the conscious and unconscious, often symbolizing an important psychological shift."},
    {"id": "archetype_37", "text": "The River: Symbolizes the flow of life, transformation, and transitions between different states of consciousness."},
    {"id": "archetype_38", "text": "The Horse: Represents instinctive energy, freedom, and unconscious power, often symbolizing the drive towards individuation."},
    {"id": "archetype_39", "text": "The Lion: Symbolizes strength, self-mastery, and courage in individuation, often appearing as a protector or guide."},
    {"id": "archetype_40", "text": "The Tree of Life: Represents growth, wisdom, and the connection to the collective unconscious, symbolizing the interconnectedness of all things."},
    {"id": "archetype_41", "text": "The Doorway: Symbolizes new beginnings, access to deeper knowledge, and the crossing of thresholds in the journey of individuation."},
    {"id": "archetype_42", "text": "The Cave: Represents deep introspection, solitude, and the confrontation with unconscious fears and desires."},
    {"id": "archetype_43", "text": "The Twin: Represents duality, inner conflict, and the integration of opposites, often symbolizing the balance between contrasting forces."},
    {"id": "archetype_44", "text": "The Tower: Symbolizes the ego’s structure, the potential isolation from the unconscious, and the need for deconstruction."},
    {"id": "archetype_45", "text": "The Mask: Represents the different facets of the self, the hidden and the revealed, often signifying the persona we project to others."},
    {"id": "archetype_46", "text": "The Wounded Healer: Represents the ability to heal others through personal suffering, often symbolizing the transformative power of vulnerability."},
    {"id": "archetype_47", "text": "The Sacrificial Victim: Symbolizes the need to let go for transformation and renewal, representing the willingness to make personal sacrifices."},
    {"id": "archetype_48", "text": "The Cosmic Egg: A symbol of potential, creation, and the birth of new consciousness, representing the primordial state of being."},
    {"id": "archetype_49", "text": "The Philosopher's Stone: Symbolizes transformation, enlightenment, and the ultimate wisdom attained through individuation."},
    {"id": "archetype_50", "text": "The Black Sun (Sol Niger): Represents deep psychological transformation and the dissolution of the ego, symbolizing the process of inner alchemy."},
    {"id": "archetype_51", "text": "The Ouroboros: The snake eating its own tail, symbolizing eternity, cycles, and self-renewal, often appearing as a symbol of unity and wholeness."},
    {"id": "archetype_52", "text": "The Alchemical Process: Represents the psychological stages of transformation (Nigredo, Albedo, Rubedo), symbolizing the purification and integration of the self."},
    {"id": "archetype_53", "text": "The Trickster God: A more divine form of the trickster, associated with chaos, change, and the possibility of spiritual rebirth."},
    {"id": "archetype_54", "text": "The World Tree: Symbolizing the axis mundi, the connection between the underworld, middle world, and heavens, representing spiritual growth and integration."},
    {"id": "archetype_55", "text": "The Cosmic Ocean: Represents the vast unconscious, primal forces, and spiritual awakening, symbolizing the universal consciousness."},
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

