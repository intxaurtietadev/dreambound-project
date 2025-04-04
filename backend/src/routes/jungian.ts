// dreambound-project-main/backend/src/routes/jungian.ts

import { Router } from 'express';
import axios from 'axios';
// Eliminamos la importación del servicio local de Pinecone
// import { getJungianArchetypes } from '../services/pineconeService';

const router = Router();

// Asegúrate de que esta variable de entorno apunte a tu servicio Flask/Python
// Debe estar definida en el archivo .env de la carpeta 'backend'
const PYTHON_AI_SERVICE = process.env.PYTHON_AI_SERVICE || 'http://localhost:5001';

// Ruta para interpretar el sueño
router.post('/interpret-dream', async (req, res) => {
  try {
    console.log("Solicitud recibida en /api/jungian/interpret-dream (Node.js)");
    const { dreamText } = req.body;

    if (!dreamText) {
      console.log("dreamText no proporcionado en la solicitud a Node.js");
      return res.status(400).json({ error: "dreamText es requerido" });
    }

    console.log(`Enviando dreamText al servicio Python en ${PYTHON_AI_SERVICE}...`);

    // Ya NO llamamos a getJungianArchetypes aquí

    // Llamamos al servicio Python SÓLO con dreamText
    const response = await axios.post(`${PYTHON_AI_SERVICE}/interpret-dream`, {
      dream_text: dreamText, // La clave debe coincidir con lo que espera Flask ('dream_text')
    });

    console.log("Respuesta recibida del servicio Python:", response.data);

    // Verificamos que la respuesta tenga los campos esperados
    if (!response.data || typeof response.data.interpretation === 'undefined' || !Array.isArray(response.data.archetypes_found)) {
        console.error("Respuesta inesperada del servicio Python:", response.data);
        return res.status(500).json({ error: "Respuesta inválida del servicio de IA" });
    }

    // Devolvemos la respuesta completa del servicio Python al frontend
    res.json({
      interpretation: response.data.interpretation,
      // Asegúrate que el nombre coincida con la clave devuelta por Python ('archetypes_found')
      archetypes: response.data.archetypes_found,
      status: response.data.status || "success" // Propaga el status si existe
    });

  } catch (error: any) {
     console.error("Error en la ruta /interpret-dream (Node.js):", error.message);
     // Mejoramos el log de errores de Axios
     if (axios.isAxiosError(error)) {
       console.error("Código de error Axios:", error.code);
       console.error("URL:", error.config?.url);
       console.error("Datos de respuesta de error:", error.response?.data);
       console.error("Status de respuesta de error:", error.response?.status);
       return res.status(error.response?.status || 500).json({
         error: "Error al comunicarse con el servicio de IA",
         details: error.response?.data || error.message // Devuelve más detalle si está disponible
       });
     }
     // Error genérico del servidor Node.js
     return res.status(500).json({ error: "Error interno del servidor al procesar la interpretación" });
  }
});

export default router;