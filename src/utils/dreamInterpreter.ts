// Enhanced dream interpretation system based on Jungian psychology
interface DreamSymbol {
  meaning: string;
  interpretation: string;
  selfCare: string;
  emotions: string[];
  associations: string[];
  archetype?: string; // Arquetipo asociado al símbolo
  psychologicalFunction?: string; // Función psicológica (pensamiento, sentimiento, sensación, intuición)
}

interface DreamAnalysis {
  interpretation: string;
  emotions: string[];
  selfCare: string[];
}

const dreamSymbols: Record<string, DreamSymbol> = {
  water: {
    meaning: "emotions, unconscious mind, purification",
    interpretation: "Water in dreams often represents your emotional state and the unconscious mind. Clear water suggests emotional clarity and purification, while turbulent or murky water might indicate emotional turmoil or unresolved feelings.",
    selfCare: "Practice emotional awareness through journaling and meditation. Consider spending time near water to connect with your emotions and reflect on their meaning.",
    emotions: ["peace", "uncertainty", "renewal", "fear", "tranquility", "chaos"],
    associations: ["emotions", "unconscious", "life force", "purification", "transformation"],
    archetype: "The Great Mother (nurturing or destructive)",
    psychologicalFunction: "Feeling"
  },
  flying: {
    meaning: "freedom, transcendence, spiritual journey",
    interpretation: "Flying dreams often represent your desire for freedom, transcendence, or spiritual elevation. The ease of flight indicates your confidence level in pursuing your goals, while difficulty flying might suggest fears or doubts holding you back.",
    selfCare: "Engage in activities that make you feel free and unbounded, such as yoga, hiking, or creative expression. Reflect on what is limiting your sense of freedom in waking life.",
    emotions: ["freedom", "joy", "anxiety", "liberation", "hope", "vulnerability"],
    associations: ["freedom", "perspective", "escape", "ambition", "spirituality"],
    archetype: "The Hero (overcoming obstacles)",
    psychologicalFunction: "Intuition"
  },
  falling: {
    meaning: "loss of control, anxiety, letting go",
    interpretation: "Falling in dreams often symbolizes feeling out of control in your waking life. It may point to fears of failure, loss, or surrender. Pay attention to what you're afraid of losing grip on, whether it's a relationship, job, or personal identity.",
    selfCare: "Practice grounding exercises such as mindfulness or yoga. Focus on what you can control and establish daily routines to create stability.",
    emotions: ["fear", "anxiety", "helplessness", "surrender", "panic", "acceptance"],
    associations: ["control", "insecurity", "surrender", "transition", "vulnerability"],
    archetype: "The Shadow (fears and insecurities)",
    psychologicalFunction: "Sensation"
  },
  house: {
    meaning: "self, psyche, personal space",
    interpretation: "Houses represent different aspects of your psyche. Each room might symbolize different parts of your personality or life. A well-maintained house suggests inner harmony, while a neglected or chaotic house might indicate unresolved issues or inner conflict.",
    selfCare: "Create a peaceful space in your home that reflects your inner needs. Consider decluttering your space and organizing areas that feel chaotic.",
    emotions: ["security", "comfort", "anxiety", "nostalgia", "stability", "chaos"],
    associations: ["self", "security", "personality", "life structure", "identity"],
    archetype: "The Self (integration of the psyche)",
    psychologicalFunction: "Thinking"
  },
  teeth: {
    meaning: "confidence, power, anxiety about appearance",
    interpretation: "Dreams about teeth often relate to confidence, personal power, and concerns about appearance. Losing teeth might suggest fear of losing authority, attractiveness, or vitality. Teeth grinding could indicate suppressed anger or tension.",
    selfCare: "Focus on self-confidence building activities. Practice positive self-talk and address any underlying insecurities about your appearance or abilities.",
    emotions: ["anxiety", "insecurity", "powerlessness", "concern", "frustration", "vulnerability"],
    associations: ["power", "confidence", "communication", "appearance", "identity"],
    archetype: "The Persona (social mask)",
    psychologicalFunction: "Feeling"
  },
  animals: {
    meaning: "instincts, natural drives, connection to nature",
    interpretation: "Animals in dreams represent your instincts and natural drives. Predatory animals might symbolize aggression or repressed desires, while gentle animals could indicate nurturing or vulnerability. The specific animal and its behavior provide deeper insight.",
    selfCare: "Connect with nature. Spend time outdoors or with pets to reconnect with your primal instincts and natural rhythms.",
    emotions: ["fear", "curiosity", "connection", "wildness", "aggression", "tenderness"],
    associations: ["instinct", "nature", "primal needs", "adaptation", "survival"],
    archetype: "The Shadow (instinctual and primitive aspects)",
    psychologicalFunction: "Sensation"
  },
  darkness: {
    meaning: "unknown, mystery, unconscious fears",
    interpretation: "Darkness represents the unknown or unexplored aspects of yourself. It might indicate areas of life you're uncertain about or fears you haven't yet confronted. Darkness can also symbolize potential and the fertile ground of the unconscious.",
    selfCare: "Practice self-reflection and journaling. Consider talking with a trusted friend or therapist about your fears and uncertainties.",
    emotions: ["fear", "uncertainty", "mystery", "potential", "awe", "apprehension"],
    associations: ["unknown", "potential", "fear", "mystery", "transformation"],
    archetype: "The Shadow (hidden aspects of the psyche)",
    psychologicalFunction: "Intuition"
  },
  snake: {
    meaning: "transformation, healing, shadow",
    interpretation: "Snakes symbolize transformation, healing, and renewal but can also represent the shadow aspect of your psyche. A snake shedding its skin suggests personal growth and the shedding of old patterns. A threatening snake might indicate unresolved fears or repressed emotions.",
    selfCare: "Reflect on areas of your life where change is needed. Embrace the process of transformation and address any fears or insecurities.",
    emotions: ["fear", "curiosity", "awe", "transformation", "healing", "resistance"],
    associations: ["change", "healing", "shadow", "rebirth", "wisdom"],
    archetype: "The Trickster (deception or transformation)",
    psychologicalFunction: "Intuition"
  },
  mirror: {
    meaning: "self-reflection, identity, inner truth",
    interpretation: "Mirrors represent self-reflection and the need to confront your true self. A clear mirror suggests self-awareness and honesty, while a cracked or distorted mirror might indicate a fragmented or unclear sense of identity.",
    selfCare: "Spend time reflecting on your identity and values. Practice self-acceptance and work on integrating conflicting aspects of your personality.",
    emotions: ["introspection", "clarity", "confusion", "truth", "self-doubt", "acceptance"],
    associations: ["identity", "self-awareness", "truth", "reflection", "integration"],
    archetype: "The Self (wholeness and integration)",
    psychologicalFunction: "Thinking"
  },
  fire: {
    meaning: "passion, destruction, renewal",
    interpretation: "Fire in dreams can symbolize passion, energy, and creativity, but it can also represent destruction, anger, or purification. Controlled fire suggests transformation and growth, while uncontrolled fire might indicate chaos or overwhelming emotions.",
    selfCare: "Channel your energy into creative projects or physical activities. Address any unresolved anger constructively through therapy or self-expression.",
    emotions: ["passion", "anger", "energy", "renewal", "destruction", "transformation"],
    associations: ["passion", "destruction", "transformation", "creativity", "purification"],
    archetype: "The Magician (creative and transformative power)",
    psychologicalFunction: "Intuition"
  },
  ladder: {
    meaning: "ambition, spiritual ascent, progress",
    interpretation: "Ladders represent your journey toward goals or spiritual growth. Climbing a ladder suggests ambition, progress, or reaching higher consciousness, while descending might indicate introspection or returning to basics.",
    selfCare: "Set achievable goals and celebrate small victories. Reflect on your spiritual journey and consider practices like meditation or mindfulness.",
    emotions: ["hope", "ambition", "fear", "progress", "determination", "hesitation"],
    associations: ["growth", "spirituality", "aspiration", "journey", "elevation"],
    archetype: "The Hero (ascent and achievement)",
    psychologicalFunction: "Thinking"
  },
  shadow: {
    meaning: "hidden aspects, repressed emotions, unconscious",
    interpretation: "A shadowy figure often represents your shadow—the hidden or repressed parts of your psyche. Engaging with the shadow can lead to greater self-awareness and integration. Ignoring the shadow might result in projection or internal conflict.",
    selfCare: "Explore your unconscious through art, writing, or therapy. Embrace your shadow with compassion and work on integrating it into your conscious self.",
    emotions: ["fear", "curiosity", "resistance", "acceptance", "shame", "courage"],
    associations: ["shadow", "unconscious", "repression", "integration", "projection"],
    archetype: "The Shadow (repressed aspects of the self)",
    psychologicalFunction: "Feeling"
  },
  bridge: {
    meaning: "transition, connection, transformation",
    interpretation: "Bridges symbolize transitions and connections between different phases of life. Crossing a bridge suggests moving forward, while avoiding it might indicate resistance to change or fear of the unknown.",
    selfCare: "Embrace life transitions with openness. Seek support during times of change and focus on building connections with others.",
    emotions: ["hope", "fear", "determination", "hesitation", "anticipation", "relief"],
    associations: ["transition", "connection", "growth", "change", "journey"],
    archetype: "The Guide (facilitating transitions)",
    psychologicalFunction: "Intuition"
  },
  tree: {
    meaning: "growth, stability, connection to roots",
    interpretation: "Trees symbolize growth, stability, and connection to your roots. A healthy tree suggests inner strength and resilience, while a dying or barren tree might indicate stagnation or lack of nourishment in your life.",
    selfCare: "Focus on personal growth and self-nurturing. Reflect on your roots—your origins, values, and foundational beliefs—and how they shape who you are today.",
    emotions: ["growth", "stability", "rootedness", "decay", "resilience", "vulnerability"],
    associations: ["growth", "roots", "stability", "life cycle", "resilience"],
    archetype: "The Great Mother (nurturing and sustaining)",
    psychologicalFunction: "Sensation"
  },
  storm: {
    meaning: "chaos, upheaval, emotional turbulence",
    interpretation: "Storms in dreams represent chaos, upheaval, or emotional turbulence. They might indicate external challenges or internal conflicts. After the storm, there is often calm, suggesting resolution or clarity after a period of struggle.",
    selfCare: "Practice grounding techniques and seek support during turbulent times. Reflect on what the storm represents in your life and how you can navigate through it.",
    emotions: ["chaos", "fear", "tension", "release", "calm", "turmoil"],
    associations: ["chaos", "upheaval", "transformation", "resolution", "emotional release"],
    archetype: "The Destroyer (breaking down old structures)",
    psychologicalFunction: "Feeling"
  }
};

const extractEmotions = (text: string): string[] => {
  const emotionWords = [
    "happy", "sad", "angry", "scared", "peaceful", "anxious", "excited", 
    "nervous", "calm", "frustrated", "joyful", "worried", "content", "afraid",
    "lonely", "loved", "confused", "confident", "uncertain", "hopeful", "ashamed",
    "guilty", "grateful", "overwhelmed", "inspired", "resentful", "compassionate",
    "jealous", "envious", "proud", "humble", "vulnerable", "empowered"
  ];
  return emotionWords.filter(emotion => text.toLowerCase().includes(emotion));
};

const analyzeDreamNarrative = (text: string): DreamAnalysis => {
  const dreamLower = text.toLowerCase();
  let interpretation = "Based on Jungian psychology, your dream suggests:\n\n";
  const emotions = extractEmotions(text);
  const selfCareRecommendations = new Set<string>();

  // Analyze dream symbols
  let symbolsFound = false;
  Object.entries(dreamSymbols).forEach(([symbol, data]) => {
    if (dreamLower.includes(symbol)) {
      symbolsFound = true;
      interpretation += `• ${data.interpretation}\n`;
      interpretation += `  - Archetype: ${data.archetype || "Not specifically associated with an archetype."}\n`;
      interpretation += `  - Psychological Function: ${data.psychologicalFunction || "Varies depending on context."}\n`;
      data.emotions.forEach(emotion => emotions.push(emotion));
      selfCareRecommendations.add(data.selfCare);
    }
  });

  // Analyze emotional tone
  if (emotions.length > 0) {
    interpretation += `\nThe emotional tone of your dream (${emotions.join(", ")}) suggests you might be processing these feelings in your waking life. `;
    interpretation += "Consider how these emotions relate to your current life situation and personal growth journey.";
  }

  // If no specific symbols are found, provide a personalized general interpretation
  if (!symbolsFound) {
    interpretation += "\nYour dream appears to be a unique expression of your unconscious mind. While it doesn't contain common archetypal symbols, the personal meanings and emotions in your dream are significant. ";
    interpretation += "Consider how the specific elements and feelings in your dream might relate to your current life situations, emotional state, and the process of individuation.";
    selfCareRecommendations.add("Take time to reflect on the personal significance of your dream symbols.");
    selfCareRecommendations.add("Consider keeping a dream journal to track patterns in your dreams.");
    selfCareRecommendations.add("Explore your unconscious through creative activities like drawing, writing, or movement.");
  }

  return {
    interpretation,
    emotions: [...new Set(emotions)],
    selfCare: [...selfCareRecommendations]
  };
};

export const interpretDream = (dreamText: string): string => {
  const analysis = analyzeDreamNarrative(dreamText);
  
  let result = analysis.interpretation;
  
  if (analysis.emotions.length > 0) {
    result += "\n\nKey emotions in your dream: " + analysis.emotions.join(", ");
  }
  
  result += "\n\nSelf-care recommendations based on your dream:";
  analysis.selfCare.forEach(recommendation => {
    result += `\n• ${recommendation}`;
  });

  return result;
};