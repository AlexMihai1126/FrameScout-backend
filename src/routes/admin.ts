/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import logger from "../config/logger.js";
import TagModel from "../models/tagModel.js";

const modulePrefix = "[AdminRoutes]";
const router = express.Router();

router.post("/tags", async (req: any, res: any) => {
  try {
    const body = req.body;

    const tagsInput = Array.isArray(body) ? body : [body];

    const tags = tagsInput.map((tag: any) => {
      const displayName = tag.displayName ?? tag.name;

      return {
        name: tag.name.toLowerCase().trim(),
        displayName: displayName.trim()
      };
    });

    const insertedTags = await TagModel.insertMany(tags, {
      ordered: false
    });

    return res.status(201).json({
      message: "Tags inserted successfully",
      count: insertedTags.length,
      tags: insertedTags
    });
  } catch (error: any) {
    logger.error(`${modulePrefix} error POST /tags:`, error);

    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

export default router;