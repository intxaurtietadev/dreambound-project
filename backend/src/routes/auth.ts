import express from "express";
import { conectarDB } from "../db";
import { IUsuario } from "../models/Usuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "tu_clave_super_secreta"; // Usar variable de entorno

// Registro de usuario
router.post("/register", async (req, res) => {
  const { nombre, email, password, bio, avatarUrl, stats, commonThemes, recentDreams } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos (nombre, email o contraseña)" });
  }

  try {
    const db = await conectarDB();

    // Validar si el email ya está registrado
    const usuarioExistente = await db.collection<IUsuario>("usuarios").findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario: IUsuario & { password: string } = {
      nombre,
      email,
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

    // Insertar el nuevo usuario en la base de datos
    const resultado = await db.collection("usuarios").insertOne(nuevoUsuario);
    res.status(201).json({ message: "Usuario creado exitosamente", insertedId: resultado.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
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

    // Crear el token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email, // También puedes incluir el email si es necesario
      },
      SECRET,
      { expiresIn: "2h" }
    );

    // Enviar token
    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
