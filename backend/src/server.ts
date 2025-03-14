import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function conectarDB() {
  await client.connect();
  console.log("Conectado a MongoDB");
  return client.db("miBaseDeDatos");
}

// Obtener usuarios
app.get("/usuarios", async (req: Request, res: Response) => {
  const db = await conectarDB();
  const usuarios = await db.collection("usuarios").find().toArray();
  res.json(usuarios);
});

// Agregar usuario
app.post("/usuarios", async (req: Request, res: Response) => {
  const db = await conectarDB();
  const resultado = await db.collection("usuarios").insertOne(req.body);
  res.json(resultado);
});

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"));
