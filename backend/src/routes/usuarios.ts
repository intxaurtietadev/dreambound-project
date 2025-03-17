// src/usuarios.ts
import express from "express";
import { conectarDB } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await conectarDB();
    const usuarios = await db.collection("usuarios").find().toArray();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = await conectarDB();
    const resultado = await db.collection("usuarios").insertOne(req.body);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agregar usuario" });
  }
});

export default router;
