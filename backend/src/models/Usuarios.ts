import mongoose, { Schema } from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true },
});

export const Usuario = mongoose.model("Usuario", UsuarioSchema);
