import { Request, Response } from "express";
import { loginService } from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
}
