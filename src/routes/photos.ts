/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import multer from "multer";
import crypto from "crypto";
import { matchedData, validationResult } from "express-validator";
import { Types } from "mongoose";

import logger from "../config/logger.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { getBaseUrl } from "../helpers/getBaseUrl.js";
import PhotoSpotModel from "../models/photoSpotModel.js";
import TagModel from "../models/tagModel.js";
import { savePhotoSpotImagesLocally } from "../helpers/localPhotoStorage.js";
import { uploadPhotoSpotValidator } from "../validators/uploadPhotoSpotValidator.js";
import { parseOptionalNumber } from "../helpers/parseOptionalNumber.js";

const modulePrefix = "[PhotoSpotRoutes]";
const router = express.Router();

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, false);
    }

    cb(null, true);
  },
});

const mapPhotoSpotResponse = (photo: any, baseUrl: string) => ({
  id: photo._id.toString(),

  title: photo.title,
  description: photo.description || null,

  city: photo.city ?? null,
  county: photo.county ?? null,
  country: photo.country,

  latitude: photo.latitude ?? null,
  longitude: photo.longitude ?? null,
  mapsUrl: photo.mapsUrl || null,

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
});

router.post(
  "/photos",
  checkAuth,
  upload.single("image"),
  uploadPhotoSpotValidator,
  async (req: any, res: any) => {
    const file: Express.Multer.File | undefined = req.file;

    if (!file) {
      return res.status(400).json({
        error:
          "Fișier lipsă sau tip nepermis. Se acceptă doar JPG, PNG sau WEBP.",
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      city,
      county,
      country,
      latitude,
      longitude,
      mapsUrl,
      tagIds = [],
    } = matchedData(req, {
      locations: ["body"],
      includeOptionals: true,
    }) as {
      title: string;
      description?: string;
      city?: string;
      county?: string;
      country: string;
      latitude?: string;
      longitude?: string;
      mapsUrl?: string;
      tagIds?: string[] | string;
    };

    try {
      const sha256 = crypto
        .createHash("sha256")
        .update(file.buffer)
        .digest("hex");

      const existingPhoto = await PhotoSpotModel.findOne({ sha256 })
        .select("_id")
        .lean();

      if (existingPhoto) {
        return res.status(400).json({
          error: "Fotografia există deja.",
        });
      }

      const safeTagIds = Array.isArray(tagIds)
        ? tagIds
        : [tagIds].filter(Boolean);

      if (safeTagIds.length) {
        const foundTags = await TagModel.find(
          {
            _id: {
              $in: safeTagIds,
            },
          },
          {
            _id: 1,
          },
        ).lean();

        if (foundTags.length !== safeTagIds.length) {
          return res.status(400).json({
            error: "Unul sau mai multe tag-uri nu există.",
          });
        }
      }

      const tagObjectIds = safeTagIds.map((tagId) => new Types.ObjectId(tagId));

      const savedImages = await savePhotoSpotImagesLocally(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      const createdPhoto = await PhotoSpotModel.create({
        title,
        description,

        city,
        county,
        country,

        latitude: parseOptionalNumber(latitude),
        longitude: parseOptionalNumber(longitude),
        mapsUrl,

        originalImgName: savedImages.originalImgName,
        previewImgName: savedImages.previewImgName,
        highResPreviewImgName: savedImages.highResPreviewImgName,

        originalName: savedImages.originalName,
        mimeType: savedImages.mimeType,
        sha256,

        originalWidth: savedImages.originalWidth,
        originalHeight: savedImages.originalHeight,

        tags: tagObjectIds,

        uploadedByUserId: req.user.uid,
      });

      const populatedPhoto = await PhotoSpotModel.findById(createdPhoto._id)
        .populate("tags")
        .lean();

      if (!populatedPhoto) {
        return res.status(500).json({
          error: "Fotografia a fost creată, dar nu a putut fi încărcată.",
        });
      }

      const baseUrl = getBaseUrl(req);

      return res.status(201).json({
        message: "Fotografia a fost încărcată cu succes.",
        photo: mapPhotoSpotResponse(populatedPhoto, baseUrl),
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          error: "O fotografie identică există deja.",
        });
      }

      logger.error(`${modulePrefix} eroare POST /photos:`, error);
      return res.status(500).json({
        error: "Eroare server",
      });
    }
  },
);

export default router;
