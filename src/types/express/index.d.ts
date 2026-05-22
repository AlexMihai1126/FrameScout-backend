declare namespace Express {
  export interface Request {
    user?: {
      uid: string;
      email?: string;
      name?: string;
      picture?: string;
    };
  }
}