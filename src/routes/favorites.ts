/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import mongoose from "mongoose";
import logger from "../config/logger.js";
import FavoriteSpotModel from "../models/favoriteSpotModel.js";
import PhotoSpotModel from "../models/photoSpotModel.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { getBaseUrl } from "../helpers/getBaseUrl.js";

const modulePrefix = "[FavoriteRoutes]";
const router = express.Router();

const mapPhotoSpotResponse = (photo: any, baseUrl: string, isFavorite = true) => ({
  id: photo._id.toString(),

  title: photo.title,
  description: photo.description ?? null,

  city: photo.city ?? null,
  county: photo.county ?? null,
  country: photo.country,

  latitude: photo.latitude ?? null,
  longitude: photo.longitude ?? null,
  mapsUrl: photo.mapsUrl ?? null,

  imageUrl: `${baseUrl}/uploads/photo-spots/${photo.highResPreviewImgName}`,
  thumbnailUrl: `${baseUrl}/uploads/photo-spots/${photo.previewImgName}`,

  tags:
    photo.tags?.map((tag: any) => ({
      id: tag._id.toString(),
      name: tag.name,
      displayName: tag.displayName,
    })) ?? [],

  uploadedByUserId: photo.uploadedByUserId ?? null,

  createdAt: photo.createdAt.toISOString(),
  updatedAt: photo.updatedAt?.toISOString() ?? null,

  isFavorite,
});

router.post("/favorites/:photoSpotId", checkAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const { photoSpotId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(photoSpotId)) {
      return res.status(400).json({ error: "ID fotografie invalid" });
    }

    const photoExists = await PhotoSpotModel.exists({ _id: photoSpotId });

    if (!photoExists) {
      return res.status(404).json({ error: "Fotografia nu a fost găsită" });
    }

    await FavoriteSpotModel.updateOne(
      {
        userId,
        photoSpotId,
      },
      {
        $setOnInsert: {
          userId,
          photoSpotId,
        },
      },
      {
        upsert: true,
      }
    );

    return res.status(201).json({
      message: "Fotografia a fost adăugată la favorite",
      isFavorite: true,
    });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare POST /favorites/:photoSpotId:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});

router.delete("/favorites/:photoSpotId", checkAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const { photoSpotId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(photoSpotId)) {
      return res.status(400).json({ error: "ID fotografie invalid" });
    }

    await FavoriteSpotModel.deleteOne({
      userId,
      photoSpotId,
    });

    return res.json({
      message: "Fotografia a fost eliminată din favorite",
      isFavorite: false,
    });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare DELETE /favorites/:photoSpotId:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});

router.get("/favorites", checkAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 20, 1),
      50
    );

    const skip = (page - 1) * limit;

    const [favoritesRes, total] = await Promise.all([
      FavoriteSpotModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "photoSpotId",
          populate: {
            path: "tags",
          },
        })
        .lean(),

      FavoriteSpotModel.countDocuments({ userId }),
    ]);

    const baseUrl = getBaseUrl(req);

    const photos = favoritesRes
      .map((favorite: any) => favorite.photoSpotId)
      .filter(Boolean)
      .map((photo: any) => mapPhotoSpotResponse(photo, baseUrl, true));

    return res.json({
      photos,
      page,
      limit,
      total,
      hasMore: skip + photos.length < total,
    });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare GET /favorites:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});

export default router;