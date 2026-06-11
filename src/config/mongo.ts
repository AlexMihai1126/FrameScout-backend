import mongoose from "mongoose";
import logger from "./logger.js";

const modulePrefix = "[Server/DB]";

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

export async function connectMongoDb() {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI environment variable.");
  }

  try {
    logger.info(`${modulePrefix} Inițializare MongoDB...`);

    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB,
    });

    logger.info(`${modulePrefix} Conectat la MongoDB.`);
  } catch (error) {
    logger.error(`${modulePrefix} Eroare inițializare MongoDB:`, error);
    throw error;
  }
}