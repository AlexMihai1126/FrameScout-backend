/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import logger from "../config/logger.js";
import TagModel from "../models/tagModel.js";
import PhotoSpotModel from "../models/photoSpotModel.js";
import mongoose from "mongoose";
import { getBaseUrl } from "../helpers/getBaseUrl.js";
import { getPhotosValidator } from "../validators/getPhotosValidator.js";
import { matchedData, validationResult } from "express-validator";
import { optionalAuth } from "../middleware/optionalAuth.js";

const modulePrefix = "[MainRoutes]";
const router = express.Router();

router.get("/photos", optionalAuth, getPhotosValidator, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      page = 1,
      limit = 20,
      q = "",
      tagIds = [],
      matchAllTags = true,
      latestFirst = true,
      mine = false
    } = matchedData(req, {
      locations: ["query"],
      includeOptionals: true,
    }) as {
      page?: number;
      limit?: number;
      q?: string;
      tagIds?: string[];
      matchAllTags?: boolean;
      latestFirst?: boolean;
      mine? : boolean;
    };

    const userId = req.user?.uid;

    const filter: any = {};

    if (mine) {
        if (!userId) {
          return res.status(401).json({
            error: "Trebuie să fii autentificat pentru a vedea fotografiile tale",
          });
        }

        filter.uploadedByUserId = userId;
      }

    const skip = (page - 1) * limit;

    if (q.length > 0) {
      const regex = new RegExp(q, "i");

      filter.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
        { county: regex },
        { country: regex },
      ];
    }

    if (tagIds.length > 0) {
      const tagObjectIds = tagIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      filter.tags = matchAllTags
        ? { $all: tagObjectIds }
        : { $in: tagObjectIds };
    }

    const [photosRes, total] = await Promise.all([
      PhotoSpotModel.find(filter)
        .sort({ createdAt: latestFirst ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate("tags")
        .lean(),

      PhotoSpotModel.countDocuments(filter),
    ]);

    const baseUrl = getBaseUrl(req);

    const photos = photosRes.map((photo: any) => ({
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

      isFavorite: false,
    }));

    return res.json({
      photos,
      page,
      limit,
      total,
      hasMore: skip + photos.length < total,
    });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare GET /photos:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});

router.get("/photos/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalid" });
    }

    const photo = await PhotoSpotModel.findById(id)
      .populate("tags")
      .lean();

    if (!photo) {
      return res.status(404).json({ error: "Fotografia nu a fost găsită" });
    }

    const baseUrl = getBaseUrl(req);

    const photoDetails = {
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

      isFavorite: false,
    };

    return res.json({ photo: photoDetails });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare GET /photos/:id:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});


router.get("/all-tags", async (req: any, res: any) => {
  try {
    const tagsRes = await TagModel.find({})
      .sort({ displayName: 1 })
      .lean();

    const tags = tagsRes.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      displayName: tag.displayName,
    }));

    return res.json({ tags });
  } catch (error: any) {
    logger.error(`${modulePrefix} eroare GET /all-tags:`, error);
    return res.status(500).json({ error: "Eroare server" });
  }
});

export default router;