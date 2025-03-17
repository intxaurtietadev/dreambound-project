import express from "express";
import { conectarDB } from "../db";
import { IUsuario } from "../models/Usuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const router = express.Router();
const SECRET = "tu_clave_super_secreta"; // o usa process.env.JWT_SECRET

// Registro de usuario
router.post("/register", async (req, res) => {
  const { nombre, password, bio, avatarUrl, stats, commonThemes, recentDreams } = req.body;
  if (!nombre || !password) return res.status(400).json({ error: "Faltan campos" });

  try {
    const db = await conectarDB();
    const existe = await db.collection<IUsuario>("usuarios").findOne({ nombre });
    if (existe) return res.status(400).json({ error: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario: IUsuario & { password: string } = {
      nombre,
      password: hashedPassword,
      bio: bio || "",
      avatarUrl: avatarUrl || "",
      stats: stats || {
        totalDreams: 0,
        lucidDreams: 0,
        currentStreak: 0,
      },
      commonThemes: commonThemes || [],
      recentDreams: recentDreams || [],
    };

    const resultado = await db.collection("usuarios").insertOne(nuevoUsuario);
    res.status(201).json({ message: "Usuario creado", insertedId: resultado.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Faltan nombre o contraseña" });
  }

  try {
    const db = await conectarDB();
    const usuario = await db
      .collection<IUsuario & { password: string }>("usuarios")
      .findOne({ nombre });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
      },
      SECRET,
      { expiresIn: "2h" }
    );

    // Enviar token + ID
    res.json({ token, id: usuario._id.toString() });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
