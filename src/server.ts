import "dotenv/config";
import express from "express";
import path from "path";
import logger from "./config/logger.js";
import { connectMongoDb } from "./config/mongo.js";
import multer from "multer";
import mainRoutes from "./routes/main.js";
import favoriteRoutes from "./routes/favorites.js"
import photoRoutes from "./routes/photos.js"


const PORT: number = Number(process.env.PORT) || 3000;

const modulePrefix = "[Server/Main]";

const app = express();

app.get("/favicon.ico", (_req, res) => res.status(204).end());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((req: any, res: any, next: any) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());

app.use(
  "/uploads/photo-spots",
  express.static(path.join(process.cwd(), "uploads", "photo-spots"))
);

app.use("/api", mainRoutes);
app.use("/api", favoriteRoutes)
app.use("/api", photoRoutes)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Fișierul nu poate depăși 20MB." });
  }
  next(err);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(
    `Excepție netratată în ${req.method} | ${req.originalUrl} `,
    err,
  );
  res.status(500).json({ message: "Eroare server" });
});

async function startup() {
  try {
    logger.info(`${modulePrefix} Pornire server backend...`);
    await connectMongoDb();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`${modulePrefix} API pornit, port ${PORT}`);
      console.log(`${modulePrefix} Serverul a pornit, port: ${PORT}.`);
    });

  } catch (error) {
    logger.error(`${modulePrefix} Eroare la inițializare:`, error);
    console.error(
      `${modulePrefix} Eroare la inițializare, verifică log-urile.`,
    );
    process.exit(1);
  }
}

startup();