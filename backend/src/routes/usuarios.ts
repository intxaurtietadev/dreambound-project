// src/routes/usuarios.ts
// --- VERSIÓN CON CORRECCIÓN EN PUT /me (quitado password de desestructuración) ---

import { Router, Response, Request } from 'express';
import { Collection, ObjectId, UpdateFilter } from 'mongodb';
import { IUsuario, Dream } from '../models/Usuarios';
import { verifyToken, AuthRequest } from '../middleware/verifyToken';
import { conectarDB } from '../db';

const router = Router();

// Helper para errores (sin cambios)
const handleError = (error: unknown, res: Response, context: string) => {
  console.error(`Error en ${context}:`, error);
  return res.status(500).json({ error: `Error al ${context}` });
};

// --- RUTA PARA OBTENER UN USUARIO POR SU ID (Añadida previamente) ---
router.get('/:userId', async (req: Request, res: Response) => {
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
// --- FIN RUTA GET /:userId ---


// Obtener usuario actual (sin cambios)
router.get("/me", verifyToken, async (req: AuthRequest, res: Response) => {
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

// Actualizar usuario (CORREGIDO)
router.put("/me", verifyToken, async (req: AuthRequest<{}, {}, Partial<IUsuario>>, res: Response) => {
  console.log(`Recibida petición PUT /usuarios/me para usuario ID: ${req.usuarioId}`);
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');

    // ---- CORRECCIÓN AQUÍ: Quitado 'password' de la desestructuración ----
    const { _id, email, ...updateData } = req.body;
    // -----------------------------------------------------------------

    // $set solo incluirá las propiedades restantes en updateData
    const update: UpdateFilter<IUsuario> = {
      $set: updateData
    };

    console.log(`Actualizando usuario ${req.usuarioId} con:`, updateData);
    const result = await usuarios.updateOne(
      { _id: new ObjectId(req.usuarioId) },
      update
    );
    console.log(`Resultado de updateOne para /me: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    return result.matchedCount > 0
      ? res.status(200).json({ message: "Usuario actualizado" })
      : res.status(404).json({ error: "Usuario no encontrado para actualizar" });
  } catch (error) {
    return handleError(error, res, "actualizar usuario (/me)");
  }
});

// Añadir sueño (sin cambios respecto a la versión anterior)
router.post("/me/dreams", verifyToken, async (req: AuthRequest<{}, {}, Dream>, res: Response) => {
  console.log(`Recibida petición POST /usuarios/me/dreams para usuario ID: ${req.usuarioId}`);
  try {
    if (!req.body.title || !req.body.description) {
        return res.status(400).json({ error: "El título y la descripción del sueño son requeridos" });
    }

    const newDream: Dream = {
      title: req.body.title,
      description: req.body.description,
      id: new ObjectId().toString(),
      date: new Date().toISOString()
    };

    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');

    const update: UpdateFilter<IUsuario> = {
      $push: { recentDreams: { $each: [newDream], $slice: -20 } },
      $inc: { "stats.totalDreams": 1 },
    };

    console.log(`Añadiendo sueño para usuario ${req.usuarioId}:`, newDream.title);
    const result = await usuarios.updateOne(
      { _id: new ObjectId(req.usuarioId) },
      update,
    );
    console.log(`Resultado de updateOne para /me/dreams: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    return result.matchedCount > 0
      ? res.status(201).json(newDream)
      : res.status(404).json({ error: "Usuario no encontrado para añadir sueño" });
  } catch (error) {
    return handleError(error, res, "agregar sueño (/me/dreams)");
  }
});

export default router;