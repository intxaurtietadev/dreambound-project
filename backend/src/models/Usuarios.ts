// src/models/Usuarios.ts
// --- VERSIÓN CON 'emotions' OPCIONAL EN Dream ---

import { ObjectId } from 'mongodb'; // Necesario para _id en IUsuario

// Interfaz Dream
export interface Dream {
  id: string; // ID generado por nosotros (string)
  date: string; // Fecha en formato ISO string
  title: string; // Título del sueño (obligatorio)
  description: string; // Descripción (obligatoria)

  // --- CAMBIO AQUÍ: Añadido '?' para hacer 'emotions' opcional ---
  emotions?: string[]; // Lista de emociones (opcional ahora)
  // --- FIN CAMBIO ---

  // Asegúrate de que estas otras propiedades también estén si las eliminaste antes
  // por error, o elimínalas si definitivamente no las quieres:
  interpretation?: string | null; // Opcional
  tags?: string[];             // Opcional
  sentiment?: string | null;     // Opcional

  // ...cualquier otro campo que definas para un sueño...
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