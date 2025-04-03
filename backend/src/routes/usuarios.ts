import { Router, Response } from 'express';
import { Collection, ObjectId, UpdateFilter } from 'mongodb';
import { IUsuario, Dream } from '../models/Usuarios';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import { conectarDB } from '../db';

const router = Router();

// Helper para errores
const handleError = (error: unknown, res: Response, context: string) => {
  console.error(`Error en ${context}:`, error);
  return res.status(500).json({ error: `Error al ${context}` });
};

// Obtener usuario actual
router.get("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    const usuario = await usuarios.findOne(
      { _id: new ObjectId(req.usuarioId) },
      { projection: { password: 0 } }
    );
    
    return usuario 
      ? res.status(200).json(usuario)
      : res.status(404).json({ error: "Usuario no encontrado" });
  } catch (error) {
    return handleError(error, res, "obtener usuario");
  }
});

// Actualizar usuario
router.put("/me", verifyToken, async (req: AuthRequest<{}, {}, Partial<IUsuario>>, res: Response) => {
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    
    const update: UpdateFilter<IUsuario> = {
      $set: req.body
    };

    const result = await usuarios.updateOne(
      { _id: new ObjectId(req.usuarioId) },
      update
    );

    return result.matchedCount > 0
      ? res.status(200).json({ message: "Usuario actualizado" })
      : res.status(404).json({ error: "Usuario no encontrado" });
  } catch (error) {
    return handleError(error, res, "actualizar usuario");
  }
});

// Añadir sueño
router.post("/me/dreams", verifyToken, async (req: AuthRequest<{}, {}, Dream>, res: Response) => {
  try {
    const newDream: Dream = {
      ...req.body,
      id: new ObjectId().toString(),
      date: new Date().toISOString()
    };

    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    
    const update: UpdateFilter<IUsuario> = {
      $push: { recentDreams: newDream },
      $inc: { "stats.totalDreams": 1 }
    };

    const result = await usuarios.updateOne(
      { _id: new ObjectId(req.usuarioId) },
      update
    );

    return result.matchedCount > 0
      ? res.status(201).json(newDream)
      : res.status(404).json({ error: "Usuario no encontrado" });
  } catch (error) {
    return handleError(error, res, "agregar sueño");
  }
});

export default router;