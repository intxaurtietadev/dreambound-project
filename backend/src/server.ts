import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { client, conectarDB } from './db';
import usuariosRoutes from './routes/usuarios';
import authRoutes from './routes/auth';
import jungianRoutes from './routes/jungian';

dotenv.config();

const app = express();

// Configuración de middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jungian", jungianRoutes);

// Ruta principal
app.get("/", (_req, res) => {
  res.send("¡Servidor funcionando!");
});

// Middleware de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal" });
});

// Conexión a la base de datos y arranque del servidor
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

// Cierre limpio
process.on("SIGINT", async () => {
  console.log("Cerrando conexión con la base de datos...");
  await client.close();
  process.exit(0);
});