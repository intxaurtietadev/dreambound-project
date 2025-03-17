// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { client, conectarDB } from "./db"; // Importar tanto `client` como `conectarDB`
import usuariosRoutes from "./routes/usuarios"; // Rutas de usuarios

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", usuariosRoutes);

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
    process.exit(1); // Terminar el proceso si la conexión falla
  });

// Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal" });
});

// Cerrar la conexión cuando el servidor se detenga
process.on("SIGINT", async () => {
  console.log("Cerrando conexión con la base de datos...");
  await client.close(); // Ahora usamos `client.close()` para cerrar la conexión
  process.exit(0); // Terminar el proceso con éxito
});
