import { ObjectId } from 'mongodb';

export interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  emotions: string[];
  isLucid?: boolean;
  archetypes?: string[];
}

export interface IUsuario {
  _id?: ObjectId;
  nombre: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  stats?: {
    totalDreams: number;
    lucidDreams: number;
    currentStreak: number;
  };
  commonThemes?: string[];
  recentDreams?: Dream[];
}