// src/models/Usuarios.ts
// --- VERSIÓN CON 'emotions' OPCIONAL EN Dream ---

import { ObjectId } from 'mongodb'; // Necesario para _id en IUsuario

// Interfaz Dream
export interface Dream {
  id: string;
  date: string;
  title: string;
  description: string;
  interpretation?: string | null;
  reflection?: string | null;
  // --- AÑADIR ESTA LÍNEA ---
  archetypesFound?: Array<{ name: string; score: number }>; // Array de objetos (opcional)
  // --- FIN LÍNEA A AÑADIR ---
  emotions?: string[]; // La hicimos opcional antes
  // Asegúrate de que los siguientes también estén si los quieres (opcionales)
  tags?: string[];
  sentiment?: string | null;
}

// Interfaz IUsuario
export interface IUsuario {
  _id?: ObjectId; // Opcional porque MongoDB lo genera al insertar
  nombre: string;
  email: string;
  // NOTA: No incluimos 'password' aquí porque no queremos exponerlo.
  // La propiedad 'password' se maneja por separado en las rutas al crear/comparar.
  bio: string;
  avatarUrl: string;
  stats: {
    totalDreams: number;
    lucidDreams: number;
    currentStreak: number;
  };
  commonThemes: string[];
  recentDreams: Dream[]; // Array de objetos Dream
}