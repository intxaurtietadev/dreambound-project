// routes/dreamInterpretation.ts
import { Router } from "express";
import { getJungianArchetypes } from "../services/pineconeService";
import { verifyToken } from "../middleware/verifyToken"; // Importa el middleware

const router = Router();

router.post("/interpret-dream", verifyToken, async (req, res) => { // Aquí se aplica el middleware
  const { dreamText } = req.body;
  
  try {
    const interpretation = await getJungianArchetypes(dreamText);
    res.json({ interpretation });
  } catch (error) {
    console.error("Error al interpretar el sueño:", error);
    res.status(500).json({ message: "Error en el servidor al procesar el sueño" });
  }
});

export default router;
