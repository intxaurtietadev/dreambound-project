import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from 'mongodb';

const SECRET = process.env.JWT_SECRET || "tu_clave_super_secreta";

export interface AuthRequest<P = {}, ResBody = any, ReqBody = any, ReqQuery = any> 
  extends Request<P, ResBody, ReqBody, ReqQuery> {
  usuarioId?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET) as { id: string };
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};