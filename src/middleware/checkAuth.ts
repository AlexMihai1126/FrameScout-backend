import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase.js";

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or invalid Authorization header.",
    });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  if (!idToken) {
    res.status(401).json({
      error: "Missing Firebase ID token.",
    });
    return;
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    next();
    return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(401).json({
      error: "Invalid or expired Firebase ID token.",
    });
    return;
  }
}