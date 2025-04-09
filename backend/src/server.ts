// dreambound-project-main/backend/src/server.ts
// --- VERSIÓN CON LOG DE DIAGNÓSTICO ANTES DE /api/auth ---

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { client, conectarDB } from './db'; // Asumiendo que db.ts está en el mismo directorio (src)
import usuariosRoutes from './routes/usuarios'; // Asumiendo que usuarios.ts está en src/routes/
import authRoutes from './routes/auth';       // Asumiendo que auth.ts está en src/routes/
import jungianRoutes from './routes/jungian';   // Asumiendo que jungian.ts está en src/routes/

dotenv.config();

const app = express();

// Configuración de middleware
console.log("Configurando middleware..."); // Log adicional
app.use(cors({
  origin: "http://localhost:5173", // Asegúrate que coincide con tu URL de frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // Middleware para parsear JSON (importante que esté antes de las rutas)
console.log("Middleware configurado.");

// Rutas
console.log("Montando rutas...");
app.use("/usuarios", usuariosRoutes); // Rutas de usuarios generales (si aún las usas)

// ---- NUEVO MIDDLEWARE DE LOG ----
// Este log se ejecutará para CUALQUIER petición que empiece con /api/auth ANTES
// de que llegue a las rutas definidas en authRoutes (auth.ts)
app.use("/api/auth", (req, res, next) => {
  // Usamos template literals correctamente con ${}
  console.log(`--> Petición ${req.method} recibida para /api/auth${req.path}`);
  next(); // MUY IMPORTANTE llamar a next() para pasar a la siguiente ruta/middleware
});
// ---- FIN NUEVO MIDDLEWARE DE LOG ----

app.use("/api/auth", authRoutes);    // Rutas de autenticación (definidas en auth.ts)

// ---- Log de Diagnóstico para jungianRoutes (lo dejamos por si acaso) ----
console.log("--- Inspeccionando jungianRoutes ---");
try {
  console.log("Tipo de jungianRoutes:", typeof jungianRoutes);
  console.log("Stack de jungianRoutes (si existe):", (jungianRoutes as any).stack ? `${(jungianRoutes as any).stack.length} rutas internas` : 'Stack no disponible');
} catch (e) {
  console.error("Error al inspeccionar jungianRoutes:", e);
}
console.log("---------------------------------");
// ---- Fin Log ----

app.use("/api/jungian", jungianRoutes); // Monta las rutas jungianas

console.log("Rutas montadas.");

// Ruta principal
app.get("/", (_req, res) => {
  console.log("Acceso a ruta principal /"); // Log para ver si el servidor responde
  res.send("¡Servidor funcionando!");
});

// Middleware de errores (debe ir al final)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("--- ERROR CAPTURADO POR MIDDLEWARE ---");
  console.error(err.stack);
  console.error("------------------------------------");
  res.status(500).json({ error: "Algo salió mal en el servidor" });
});

// Conexión a la base de datos y arranque del servidor
console.log("Iniciando conexión a DB y servidor...");
conectarDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error fatal al conectar a la base de datos:", error);
    process.exit(1); // Salir si no se puede conectar a la DB
  });

// Cierre limpio
process.on("SIGINT", async () => {
  console.log("\nCerrando conexión con la base de datos por SIGINT...");
  try {
    await client.close();
    console.log("Conexión DB cerrada.");
  } catch(err) {
    console.error("Error al cerrar conexión DB:", err);
  }
  process.exit(0);
});