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

// === RUTAS PROTEGIDAS (Requieren Token - /me) ===

// Obtener usuario actual (AHORA VA ANTES QUE /:userId)
router.get("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  console.log(`Recibida petición GET /usuarios/me. ID de usuario desde token: ${req.usuarioId}`); // Log inicial

  let userObjectId;
  try {
    // Validar y convertir el ID del token (string) a ObjectId
    if (!req.usuarioId || typeof req.usuarioId !== 'string') {
        throw new Error('req.usuarioId no está definido o no es un string');
    }
    userObjectId = new ObjectId(req.usuarioId); // Punto de posible fallo si el ID en JWT es inválido
  } catch (error) {
    console.error("Error: ID de usuario inválido en token:", req.usuarioId, error);
    return res.status(400).json({ error: 'ID de usuario inválido en token' });
  }

  // Continuar si la conversión fue exitosa
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');

    console.log(`Buscando usuario para /me con _id: ${userObjectId}`);
    const usuario = await usuarios.findOne(
      { _id: userObjectId },
      { projection: { password: 0 } } // Excluir password
    );

    if (usuario) {
        // Log de datos encontrados (opcional, quitar si es mucha info)
        console.log(`Datos de usuario encontrados para /me (ID: ${req.usuarioId}):`, {
            _id: usuario._id,
            nombre: usuario.nombre,
            dominantArchetype: usuario.dominantArchetype, // Loguear arquetipo si existe
            recentDreamsCount: usuario.recentDreams?.length,
            firstDreamReflectionExists: usuario.recentDreams?.[0]?.reflection !== undefined
        });
        return res.status(200).json(usuario); // Enviar datos del usuario
    } else {
        console.log(`Usuario NO Encontrado para /me (ID: ${req.usuarioId})`);
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    return handleError(error, res, "obtener usuario actual (/me)");
  }
});

// Actualizar usuario actual
router.put("/me", verifyToken, async (req: AuthRequest<{}, {}, Partial<IUsuario>>, res: Response) => {
  console.log(`Recibida petición PUT /usuarios/me para usuario ID: ${req.usuarioId}`);
  try {
    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    const { _id, email, ...updateData } = req.body; // Excluir _id y email del $set directo
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

// Añadir sueño al usuario actual
router.post("/me/dreams", verifyToken, async (req: AuthRequest<{}, {}, Partial<Dream>>, res: Response) => {
  console.log(`Recibida petición POST /usuarios/me/dreams para usuario ID: ${req.usuarioId}`);
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ error: "El título y la descripción del sueño son requeridos" });
    }

    const newDream: Dream = {
      id: new ObjectId().toString(),
      date: req.body.date || new Date().toISOString(),
      title: req.body.title,
      description: req.body.description,
      interpretation: req.body.interpretation || null,
      archetypesFound: Array.isArray(req.body.archetypesFound) ? req.body.archetypesFound : [],
      reflection: req.body.reflection || null,
      emotions: req.body.emotions || [],
      tags: req.body.tags || [],
      sentiment: req.body.sentiment || null
    };

    const db = await conectarDB();
    const usuarios = db.collection<IUsuario>('usuarios');
    const update: UpdateFilter<IUsuario> = {
      $push: { recentDreams: { $each: [newDream], $slice: -20 } }, // Mantener últimos 20
      $inc: { "stats.totalDreams": 1 },
    };

    console.log(`Añadiendo sueño para usuario ${req.usuarioId}:`, newDream.title);
    const result = await usuarios.updateOne({ _id: new ObjectId(req.usuarioId) }, update );
    console.log(`Resultado de updateOne para /me/dreams: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

    if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Usuario no encontrado para añadir sueño" });
    }
    return res.status(201).json(newDream); // Devolver el sueño añadido

  } catch (error) {
    return handleError(error, res, "agregar sueño (/me/dreams)");
  }
});

// Guardar/Actualizar Reflexión de un sueño específico del usuario actual
router.put('/me/dreams/:dreamId/reflection', verifyToken, async (req: AuthRequest<{ dreamId: string }, any, { reflectionText: string }>, res: Response) => {
  const { dreamId } = req.params;
  const { reflectionText } = req.body;
  const userId = req.usuarioId;

  console.log(`Recibida petición PUT /usuarios/me/dreams/${dreamId}/reflection para usuario ${userId}`);

  if (typeof reflectionText !== 'string') {
    return res.status(400).json({ error: 'Falta el texto de la reflexión (reflectionText) o no es un string' });
  }
  if (!userId) {
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
});

// === RUTAS PÚBLICAS (O que no dependen de /me) ===

// --- RUTA GET /:userId (AHORA VA DESPUÉS DE /me) ---
// Obtener un usuario por su ID (podría ser pública o requerir otro tipo de auth)
router.get('/:userId', async (req: Request, res: Response) => {
  const userIdString = req.params.userId;
  console.log(`Recibida petición GET /usuarios/${userIdString} (ruta genérica)`); // Log diferente

  let userIdObj;
  try {
    userIdObj = new ObjectId(userIdString);
  } catch (error) {
    // Loguea el error real de conversión si quieres más detalle
    console.error("Error: ID de usuario inválido en la URL:", userIdString, error);
    return res.status(400).json({ error: 'ID de usuario inválido en URL' });
  }

  try {
    const db = await conectarDB();
    console.log(`Buscando usuario (ruta genérica) con _id: ${userIdObj}`);
    // Considera si necesitas excluir password aquí también
    const usuario = await db.collection('usuarios').findOne(
      { _id: userIdObj },
      { projection: { password: 0 } } // Excluir password
    );

    if (!usuario) {
      console.log(`Usuario con ID ${userIdString} no encontrado (ruta genérica).`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`Usuario con ID ${userIdString} encontrado, enviando datos (ruta genérica).`);
    res.status(200).json(usuario); // Enviar datos

  } catch (err) {
    return handleError(err, res, `buscar usuario con ID ${userIdString}`);
  }
});
// --- FIN RUTA GET /:userId ---


// Exportar el router
export default router;