import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";  // Asegúrate de tener bcrypt instalado
import { conectarDB } from "../db";
import { IUsuario, Dream } from "../models/Usuarios";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";

const router = express.Router();

// Obtener todos los usuarios
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await conectarDB();
    const usuarios = await db.collection<IUsuario>("usuarios").find().toArray();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear un nuevo usuario
router.post("/", async (req: Request<{}, {}, Partial<IUsuario>>, res: Response) => {
  try {
    const { nombre, email, password, avatarUrl = "", bio = "" } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "El nombre, email y contraseña son obligatorios" });
    }

    const db = await conectarDB();
    const existingUser = await db.collection<IUsuario>("usuarios").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario: IUsuario = {
      nombre,
      email,
      password: hashedPassword,
      avatarUrl,
      bio,
      stats: {
        totalDreams: 0,
        lucidDreams: 0,
        currentStreak: 0
      },
      commonThemes: [],
      recentDreams: []
    };

    const resultado = await db.collection<IUsuario>("usuarios").insertOne(nuevoUsuario);
    res.json({
      message: "Usuario creado exitosamente",
      insertedId: resultado.insertedId,
      usuario: nuevoUsuario
    });    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

// Añadir un nuevo sueño a un usuario (protegido)
router.patch("/:id/dreams", verifyToken, async (req: AuthRequest<{ id: string }, {}, Dream>, res: Response) => {
  try {
    const db = await conectarDB();
    const { id } = req.params;
    const nuevoSueno = req.body;

    if (!nuevoSueno.title || !nuevoSueno.description || !nuevoSueno.date || !Array.isArray(nuevoSueno.emotions)) {
      return res.status(400).json({ error: "Datos del sueño inválidos" });
    }

    if (req.usuarioId !== id) {
      return res.status(403).json({ error: "No tienes permiso para modificar este perfil" });
    }

    await db.collection<IUsuario>("usuarios").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { recentDreams: nuevoSueno },
        $inc: { "stats.totalDreams": 1, "stats.currentStreak": 1 }
      }
    );

    const usuarioActualizado = await db.collection<IUsuario>("usuarios").findOne({ _id: new ObjectId(id) });

    res.json({
      message: "Sueño añadido correctamente",
      recentDreams: usuarioActualizado?.recentDreams || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al añadir el sueño" });
  }
});

// Obtener un usuario por ID
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const db = await conectarDB();
    const { id } = req.params;

    const usuario = await db.collection<IUsuario>("usuarios").findOne({ _id: new ObjectId(id) });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

export default router;
