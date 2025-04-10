// src/routes/usuarios.ts
// --- VERSIÓN CON CORRECCIONES DE TYPESCRIPT ---

import { Router, Response, Request } from 'express';
import { Collection, ObjectId, UpdateFilter } from 'mongodb';
import { IUsuario, Dream } from '../models/Usuarios'; // Asegúrate que importa la interfaz Dream actualizada
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import { conectarDB } from '../db';

const router = Router();

// Helper para errores
const handleError = (error: unknown, res: Response, context: string) => {
  console.error(`Error en ${context}:`, error);
  return res.status(500).json({ error: `Error al ${context}` });
};

// --- RUTA GET /:userId (Sin cambios) ---
router.get('/:userId', async (req: Request, res: Response) => {
  // ... (código igual que antes) ...
  const userIdString = req.params.userId;
  console.log(`Recibida petición GET /usuarios/${userIdString}`);
  let userIdObj;
  try {
    userIdObj = new ObjectId(userIdString);
  } catch (error) {
    console.error("Error: ID de usuario inválido en la URL:", userIdString);
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }
  try {
    const db = await conectarDB();
    console.log(`Buscando usuario con _id: ${userIdObj}`);
    const usuario = await db.collection('usuarios').findOne(
      { _id: userIdObj },
      { projection: { password: 0 } }
    );
    if (!usuario) {
      console.log(`Usuario con ID ${userIdString} no encontrado.`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log(`Usuario con ID ${userIdString} encontrado, enviando datos.`);
    res.status(200).json(usuario);
  } catch (err) {
    return handleError(err, res, `buscar usuario con ID ${userIdString}`);
  }
});

// --- RUTA GET /me (Sin cambios) ---
router.get("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  // ... (código igual que antes) ...
  console.log(`Recibida petición GET /usuarios/me para usuario ID: ${req.usuarioId}`);
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    const usuario = await usuarios.findOne(
      { _id: new ObjectId(req.usuarioId) },
      { projection: { password: 0 } }
    );
    console.log(`Resultado para /me: ${usuario ? 'Encontrado' : 'NO Encontrado'}`);
    return usuario
      ? res.status(200).json(usuario)
      : res.status(404).json({ error: "Usuario no encontrado" });
  } catch (error) {
    return handleError(error, res, "obtener usuario actual (/me)");
  }
});

// --- RUTA PUT /me (Sin cambios) ---
router.put("/me", verifyToken, async (req: AuthRequest<{}, {}, Partial<IUsuario>>, res: Response) => {
  // ... (código igual que antes) ...
  console.log(`Recibida petición PUT /usuarios/me para usuario ID: ${req.usuarioId}`);
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    const { _id, email, ...updateData } = req.body;
    const update: UpdateFilter<IUsuario> = { $set: updateData };
    console.log(`Actualizando usuario ${req.usuarioId} con:`, updateData);
    const result = await usuarios.updateOne( { _id: new ObjectId(req.usuarioId) }, update );
    console.log(`Resultado de updateOne para /me: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
    return result.matchedCount > 0
      ? res.status(200).json({ message: "Usuario actualizado" })
      : res.status(404).json({ error: "Usuario no encontrado para actualizar" });
  } catch (error) {
    return handleError(error, res, "actualizar usuario (/me)");
  }
});

// --- RUTA POST /me/dreams (Asegurarse que usa archetypesFound) ---
router.post("/me/dreams", verifyToken, async (req: AuthRequest<{}, {}, Partial<Dream>>, res: Response) => { // Body puede ser Partial<Dream>
  console.log(`Recibida petición POST /usuarios/me/dreams para usuario ID: ${req.usuarioId}`);
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ error: "El título y la descripción del sueño son requeridos" });
    }

    // Crear el objeto newDream asegurándose de que las propiedades coinciden con la Interfaz Dream
    const newDream: Dream = {
      id: new ObjectId().toString(),
      date: req.body.date || new Date().toISOString(),
      title: req.body.title,
      description: req.body.description,
      interpretation: req.body.interpretation || null,
      // Asegurarse que archetypesFound ahora existe en Dream (lo añadimos en models/Usuarios.ts)
      archetypesFound: Array.isArray(req.body.archetypesFound) ? req.body.archetypesFound : [],
      reflection: req.body.reflection || null, // Añadido por si se envía
      emotions: req.body.emotions || [], // Añadido por si se envía
      tags: req.body.tags || [],       // Añadido por si se envía
      sentiment: req.body.sentiment || null // Añadido por si se envía
    };

    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');

    const update: UpdateFilter<IUsuario> = {
      $push: { recentDreams: { $each: [newDream], $slice: -20 } },
      $inc: { "stats.totalDreams": 1 },
    };

    console.log(`Añadiendo sueño para usuario ${req.usuarioId}:`, newDream.title);
    const result = await usuarios.updateOne({ _id: new ObjectId(req.usuarioId) }, update );
    console.log(`Resultado de updateOne para /me/dreams: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Usuario no encontrado para añadir sueño" });
    }
    // Devolver el sueño creado
    return res.status(201).json(newDream);

  } catch (error) {
    return handleError(error, res, "agregar sueño (/me/dreams)");
  }
});

// --- RUTA PUT /me/dreams/:dreamId/reflection (Tipado de params corregido) ---
// Definimos una interfaz para los parámetros esperados en esta ruta
interface ReflectionParams {
  dreamId: string;
}
// Definimos una interfaz para el cuerpo esperado
interface ReflectionBody {
  reflectionText: string;
}

// Usamos las interfaces para tipar req.params y req.body
router.put(
  '/me/dreams/:dreamId/reflection',
  verifyToken,
  async (req: AuthRequest<ReflectionParams, any, ReflectionBody>, res: Response) => {

    // Ahora TypeScript sabe que req.params tiene dreamId y req.body tiene reflectionText
    const { dreamId } = req.params;
    const { reflectionText } = req.body;
    const userId = req.usuarioId;

    console.log(`Recibida petición PUT /usuarios/me/dreams/${dreamId}/reflection para usuario ${userId}`);

    if (typeof reflectionText !== 'string') {
      return res.status(400).json({ error: 'Falta el texto de la reflexión (reflectionText) o no es un string' });
    }
    if (!userId) { // Redundante si verifyToken funciona, pero seguro
      return res.status(401).json({ error: 'Usuario no autorizado' });
    }
    if (!dreamId || typeof dreamId !== 'string') {
      return res.status(400).json({ error: 'ID de sueño inválido en URL' });
    }

    try {
      const db = await conectarDB();
      const usuarios = db.collection<IUsuario>('usuarios');
      const userObjectId = new ObjectId(userId);

      const result = await usuarios.updateOne(
        { _id: userObjectId, "recentDreams.id": dreamId },
        { $set: { "recentDreams.$.reflection": reflectionText } }
      );

      console.log(`Resultado de updateOne para reflexión: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Usuario o sueño no encontrado para actualizar la reflexión' });
      }
      res.status(200).json({ message: 'Reflexión guardada exitosamente' });

    } catch (error) {
      return handleError(error, res, `guardar reflexión para sueño ${dreamId}`);
    }
  }
);
// --- FIN RUTA PUT .../reflection ---

export default router;