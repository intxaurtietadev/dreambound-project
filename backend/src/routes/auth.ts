// src/routes/auth.ts
// --- VERSIÓN CON LOG AL INICIO DE POST /login ---

import express from "express";
import { conectarDB } from "../db";
import { IUsuario } from "../models/Usuarios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { ObjectId } from "mongodb"; // <- Sigue aquí, aunque no se use activamente

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "tu_clave_super_secreta"; // Usar variable de entorno

// Registro de usuario (sin cambios)
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

    // Crear token JWT tras registrar
    const token = jwt.sign(
      {
        id: resultado.insertedId,
        nombre,
        email,
      },
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token,
      userId: resultado.insertedId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  // ----> NUEVA LÍNEA DE LOG AÑADIDA AQUÍ <----
  console.log("!!! PRIMERA LÍNEA DENTRO de router.post(/login) en auth.ts !!!");

  // El resto de tu código original sigue aquí...
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    // Añadimos un log aquí también por si acaso
    console.log("Login fallido: Faltan nombre o contraseña en el body.");
    return res.status(400).json({ error: "Faltan nombre o contraseña" });
  }

  // Añadimos log antes del try/catch
  console.log(`Intentando login para usuario: ${nombre}`);

  try {
    // Añadimos log antes de conectar a DB
    console.log("Conectando a DB para login...");
    const db = await conectarDB();
    console.log("Conectado a DB. Buscando usuario...");
    const usuario = await db
      .collection<IUsuario & { password: string }>("usuarios")
      .findOne({ nombre });
    console.log("Resultado de findOne:", usuario ? `Usuario encontrado (ID: ${usuario._id})` : "Usuario NO encontrado");


    if (!usuario) {
      console.log(`Login fallido para ${nombre}: Usuario no encontrado.`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Añadimos log antes de comparar contraseña
    console.log(`Comparando contraseña para ${nombre}...`);
    const passwordValida = await bcrypt.compare(password, usuario.password);
    console.log("Resultado de bcrypt.compare:", passwordValida);

    if (!passwordValida) {
       console.log(`Login fallido para ${nombre}: Contraseña incorrecta.`);
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Añadimos log antes de firmar token
    console.log(`Contraseña válida para ${nombre}. Firmando token...`);
    // Crear el token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
      SECRET,
      { expiresIn: "2h" }
    );
    console.log(`Token firmado para ${nombre}. Enviando respuesta.`);

    // Enviar token
    res.json({ token });

  } catch (err) {
    // Log del error capturado
    console.error(`Error CAPTURADO en login para ${nombre}:`, err);
    res.status(500).json({ error: "Error en el servidor" });
  }

});

export default router;