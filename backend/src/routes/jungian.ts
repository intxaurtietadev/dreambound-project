import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Lee la URL del servicio Python desde el .env del backend
const PYTHON_AI_SERVICE = process.env.PYTHON_AI_SERVICE || 'http://localhost:5001';

// Ruta para interpretar el sueño
router.post('/interpret-dream', async (req, res) => {
  // Quitamos el log de prueba ¡¡¡ RUTA ... !!!
  try {
    console.log("Solicitud recibida en /api/jungian/interpret-dream (Node.js)"); // Mantenemos este log
    const { dreamText } = req.body;

    if (!dreamText) {
      console.log("dreamText no proporcionado en la solicitud a Node.js");
      return res.status(400).json({ error: "dreamText es requerido" });
    }

    console.log(`Enviando dreamText al servicio Python en ${PYTHON_AI_SERVICE}...`);

    // --- Llamada al servicio Python RESTAURADA ---
    const response = await axios.post(`${PYTHON_AI_SERVICE}/interpret-dream`, {
      dream_text: dreamText, // La clave 'dream_text' coincide con lo que espera Flask
    });
    // --- Fin Llamada ---

    console.log("Respuesta recibida del servicio Python:", response.data);

    // Verifica que la respuesta del servicio Python tenga los datos esperados
    if (!response.data || typeof response.data.interpretation === 'undefined' || !Array.isArray(response.data.archetypes_found)) {
        console.error("Respuesta inesperada del servicio Python:", response.data);
        // Podrías devolver un error 502 Bad Gateway si el servicio AI falla internamente
        return res.status(502).json({ error: "Respuesta inválida del servicio de IA" });
    }

    // Envía la respuesta obtenida del servicio Python de vuelta al frontend
    res.json({
      interpretation: response.data.interpretation,
      archetypes: response.data.archetypes_found, // Mapeado a 'archetypes' para el frontend
      status: response.data.status || "success"
    });

  } catch (error: any) {
     console.error("Error en la ruta /interpret-dream (Node.js):", error.message);
     if (axios.isAxiosError(error)) {
         console.error("Código de error Axios:", error.code);
         console.error("URL:", error.config?.url);
         // Si el error viene del servicio Python, su respuesta de error estará en error.response.data
         console.error("Datos de respuesta de error del servicio Python?:", error.response?.data);
         console.error("Status de respuesta de error:", error.response?.status);
         // Devolver un error 502 (Bad Gateway) si el servicio Python falla
         return res.status(error.response?.status || 502).json({
           error: "Error al comunicarse con el servicio de IA",
           details: error.response?.data || error.message
         });
     }
     // Error interno del servidor Node.js antes de llamar a Python
     return res.status(500).json({ error: "Error interno del servidor antes de llamar al servicio de IA" });
  }
});

export default router;