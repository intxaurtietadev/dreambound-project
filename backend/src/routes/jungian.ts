import { Router } from 'express';
import axios from 'axios';
import { getJungianArchetypes } from '../services/pineconeService';

const router = Router();
const PYTHON_AI_SERVICE = process.env.PYTHON_AI_SERVICE || 'http://localhost:5001';

// Ruta para interpretar el sueño
router.post('/interpret-dream', async (req, res) => {
  try {
    console.log("Solicitud recibida en /interpret-dream");
    const { dreamText } = req.body;
    
    if (!dreamText) {
      console.log("dreamText no proporcionado");
      return res.status(400).json({ error: "dreamText is required" });
    }

    console.log("Obteniendo arquetipos Jungianos...");
    const archetypes = await getJungianArchetypes(dreamText);
    console.log("Arquetipos obtenidos:", archetypes);

    if (archetypes.length === 0) {
      console.log("No se encontraron arquetipos");
      return res.status(404).json({ error: "No se encontraron arquetipos" });
    }

    console.log("Enviando solicitud al servicio Python...");
    const response = await axios.post(`${PYTHON_AI_SERVICE}/interpret-dream`, {
      dream_text: dreamText,
      relevant_archetypes: archetypes // Enviamos los arquetipos encontrados
    });
    console.log("Respuesta del servicio Python:", response.data);

    res.json({
      interpretation: response.data.interpretation,
      archetypes: archetypes,
      status: "success"
    });
  } catch (error) {
    console.error("Error en interpretación:", error);
    res.status(500).json({ error: "Error al interpretar el sueño" });
  }
});

export default router;