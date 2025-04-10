import { ObjectId } from 'mongodb';

// Interfaz Dream
export interface Dream {
  id: string;
  date: string;
  title: string;
  description: string;
  interpretation?: string | null;
  reflection?: string | null;   // <-- Confirmado/Asegurado que existe
  archetypesFound?: Array<{ name: string; score: number }>;
  emotions?: string[];
  tags?: string[];
  sentiment?: string | null;
}

// Interfaz IUsuario (MODIFICAR ESTA)
export interface IUsuario {
  _id?: ObjectId;
  nombre: string;
  email: string;
  bio: string;
  avatarUrl: string;
  stats: {
    totalDreams: number;
    lucidDreams: number;
    currentStreak: number;
  };
  commonThemes: string[];
  recentDreams: Dream[]; // Usa la interfaz Dream actualizada
  dominantArchetype?: string | null; // Guardará el nombre del arquetipo dominante (opcional)
}