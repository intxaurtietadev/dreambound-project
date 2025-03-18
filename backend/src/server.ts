// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { client, conectarDB } from "./db";
import usuariosRoutes from "./routes/usuarios";
import authRoutes from "./routes/auth"; // ✅ Importamos tus rutas de auth

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes); // ✅ Añadimos el endpoint /api/auth/register y /api/auth/login

// Conectar a la base de datos antes de arrancar el servidor
conectarDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a la base de datos:", error);
    process.exit(1);
  });

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal" });
});

// Cerrar conexión a la base de datos al cerrar servidor
process.on("SIGINT", async () => {
  console.log("Cerrando conexión con la base de datos...");
  await client.close();
  process.exit(0);
});
