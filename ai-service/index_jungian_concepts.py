import pinecone
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")

# Initialize Pinecone
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
index_name = "jungian-concepts"

if index_name not in pinecone.list_indexes():
    pinecone.create_index(index_name, dimension=384)  # Adjust dimension according to the embedding model

index = pinecone.Index(index_name)

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Expanded list of Jungian concepts
jungian_concepts = [
    "The Self: Represents the totality of the psyche and the union between the conscious and unconscious.",
    "The Shadow: Repressed or unknown aspects of our personality.",
    "The Anima: Feminine image in the unconscious of a man, representing emotion and intuition.",
    "The Animus: Masculine image in the unconscious of a woman, representing logic and rationality.",
    "The Persona: The social mask we wear in everyday life.",
    "The Wise Old Man: Archetypal figure representing wisdom and guidance.",
    "The Great Mother: Archetype symbolizing nurturing, protection, and also the devouring aspect.",
    "The Hero: Figure that faces challenges to achieve individuation.",
    "The Trickster: Archetype of the deceiver, breaking rules and creating chaos for transformation.",
    "Individuation: The process of integrating the conscious and unconscious to achieve wholeness.",
    "The Collective Unconscious: Deep level of the psyche shared by all humanity, filled with archetypes.",
    "The Personal Unconscious: Contains repressed memories, experiences, and complexes.",
    "The Complex: A set of repressed emotions and memories with emotional charge.",
    "The Symbol: Representation of a deeper meaning, usually connected to the unconscious.",
    "The Mandala: Symbol of wholeness and inner order, used in individuation.",
    "The Dragon: Represents fear, the shadow, and the need for transformation.",
    "The Hero's Journey: The archetypal path of transformation and growth.",
    "The Ring: Symbolizes wholeness and connection to the infinite.",
    "Water: Represents the unconscious, emotions, and transformation.",
    "The Forest: Place of the unknown, mystery, and encounter with the unconscious.",
    "The Mountain: Symbol of spiritual achievement, enlightenment, and connection with the Self.",
    "The Labyrinth: Represents the search for knowledge and internal confusion.",
    "The Serpent: Symbolizes transformation, rebirth, and vital energy.",
    "The Sun and the Moon: The sun represents consciousness, reason, and masculinity; the moon symbolizes the unconscious, intuition, and femininity.",
    "The Mirror: Reflects the truth about the self, the unconscious, and the need for self-knowledge.",
    "The Inner Child: The innocent, creative, and spontaneous part of the psyche.",
    "The Warrior: Symbolizes the internal and external struggle for truth and transformation.",
    "The Orphan: Archetype of vulnerability and the desire to belong.",
    "The King and Queen: Represent authority, wisdom, and inner order.",
    "The Desert: Represents trials, introspection, and the search for meaning.",
    "The Phoenix: Symbolizes death and rebirth, profound transformation.",
    "The Skeleton or Death: Represents the end of a cycle and psychological rebirth.",
    "The Ship or Navigation: Symbolizes the soul’s journey and exploration of the unconscious.",
    "The Bridge: Represents transition and connection between the conscious and unconscious.",
    "The River: Symbolizes the flow of life and transitions between states of consciousness.",
    "The Horse: Represents instinctive energy, freedom, and unconscious power.",
    "The Lion: Symbolizes strength, self-mastery, and courage in individuation.",
    "The Tree of Life: Represents growth, wisdom, and connection to the collective unconscious.",
    "The Doorway: Symbolizes new beginnings and access to deeper knowledge.",
    "The Cave: Represents deep introspection and confrontation with the unconscious.",
    "The Twin: Symbolizes duality, inner conflict, and integration of opposites.",
    "The Tower: Represents the ego’s structure and potential isolation from the unconscious.",
    "The Mask: Highlights different facets of the self, the hidden and the revealed.",
    "The Wounded Healer: Represents the ability to heal others through personal suffering.",
    "The Sacrificial Victim: Symbolizes the need to let go for transformation and renewal.",
    "The Spiral: Represents evolution, cycles of change, and spiritual growth."
]

# Convert concepts into embeddings and upload them to Pinecone
for concept in jungian_concepts:
    embedding = model.encode(concept).tolist()
    index.upsert([(concept, embedding)])

print("Jungian concept embeddings stored in Pinecone.")
