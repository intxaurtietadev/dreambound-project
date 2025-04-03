import { Router } from "express";
import axios from "axios";

const router = Router();

// Ruta para indexar conceptos jungianos
router.post("/index-concepts", async (req, res) => {
  try {
    const jungianConcepts = [
      { id: "archetype_1", text: "The Hero archetype represents the journey of self-discovery." },
      { id: "archetype_2", text: "The Shadow represents the unconscious part of the psyche." },
      { id: "archetype_3", text: "The Anima/Animus represents the inner feminine/masculine." },
      { id: "archetype_4", text: "The Self represents the totality of the psyche." },
    ];

    // Enviar los conceptos jungianos al servicio Python para indexarlos
    const response = await axios.post('http://localhost:5001/index-concepts', { concepts: jungianConcepts });
    
    res.status(200).json({ message: "Concepts indexed successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error indexing concepts" });
  }
});

// Ruta para obtener conceptos relevantes basados en un sueño
router.post("/retrieve-concepts", async (req, res) => {
  try {
    const { dreamText } = req.body;

    // Enviar el texto del sueño al servicio Python para obtener conceptos relevantes
    const response = await axios.post('http://localhost:5001/retrieve-concepts', { dreamText });

    res.status(200).json({ relevantConcepts: response.data.relevantConcepts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving concepts" });
  }
});

export default router;
