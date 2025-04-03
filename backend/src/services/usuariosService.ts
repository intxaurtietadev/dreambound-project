import { IUsuario, Dream } from '../models/Usuarios';
import { conectarDB } from '../db';

export async function obtenerUsuarioPorId(id: string) {
  const db = await conectarDB();
  const usuario = await db.collection('usuarios').findOne({ _id: id });
  return usuario;
}

export async function agregarSueño(usuarioId: string, dream: Dream) {
  const db = await conectarDB();
  const resultado = await db.collection('usuarios').updateOne(
    { _id: usuarioId },
    { $push: { recentDreams: dream } }
  );
  return resultado.modifiedCount === 1;
}