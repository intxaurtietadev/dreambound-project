import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { client, conectarDB } from "./db";
import usuariosRoutes from "./routes/usuarios";
import authRoutes from "./routes/auth";
import jungianRoutes from "./routes/jungian";  // Importa las rutas de conceptos jungianos

dotenv.config();

const app = express();

// 💡 Manejo de preflight (OPTIONS) para que CORS funcione correctamente con Vite
app.options("*", cors()); // <-- ESTE ES EL CLAVE

// ✅ Middleware de CORS configurado
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jungian", jungianRoutes);  // Agrega las rutas de conceptos jungianos

// Conexión y arranque del servidor
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

app.get("/", (req, res) => {
  res.send("¡Servidor funcionando!");
});

// Middleware global de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal" });
});

// Cierre limpio de conexión con la BD
process.on("SIGINT", async () => {
  console.log("Cerrando conexión con la base de datos...");
  await client.close();
  process.exit(0);
});
