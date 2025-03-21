export interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  emotions: string[];
}


export interface IUsuario {
  nombre: string;
  email: string;
  password: string;
  bio: string;
  avatarUrl: string;
  stats: {
    totalDreams: number;
    lucidDreams: number;
    currentStreak: number;
  };
  commonThemes: string[];
  recentDreams: Dream[];
}
