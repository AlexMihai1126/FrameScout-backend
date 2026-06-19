import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ITag } from "./tagModel.js";
import normalizeText  from "../helpers/normalizeText.js";

export interface IPhotoSpot extends Document {
  _id: Types.ObjectId;

  title: string;
  normalizedTitle: string;

  description?: string;
  normalizedDescription: string;

  city?: string;
  normalizedCity: string;

  county?: string;
  normalizedCounty: string;

  country: string;
  normalizedCountry: string;

  latitude?: number;
  longitude?: number;
  mapsUrl?: string;

  originalImgName: string;
  previewImgName: string;
  highResPreviewImgName: string;

  originalName: string;
  mimeType: string;
  sha256: string;

  originalWidth?: number;
  originalHeight?: number;

  tags?: (Types.ObjectId | ITag)[];

  uploadedByUserId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PhotoSpotSchema = new Schema<IPhotoSpot>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    normalizedTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      required: false,
    },

    normalizedDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      maxlength: 80,
      required: false,
    },

    normalizedCity: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
      index: true,
    },

    county: {
      type: String,
      trim: true,
      maxlength: 80,
      required: false,
    },

    normalizedCounty: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
      index: true,
    },

    country: {
      type: String,
      trim: true,
      maxlength: 80,
      required: true,
    },

    normalizedCountry: {
      type: String,
      trim: true,
      maxlength: 80,
      required: true,
      default: "",
      index: true,
    },

    latitude: {
      type: Number,
      required: false,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: false,
      min: -180,
      max: 180,
    },

    mapsUrl: {
      type: String,
      trim: true,
      required: false,
    },

    originalImgName: {
      type: String,
      required: true,
    },

    previewImgName: {
      type: String,
      required: true,
    },

    highResPreviewImgName: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    sha256: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    originalWidth: {
      type: Number,
      required: false,
    },

    originalHeight: {
      type: Number,
      required: false,
    },

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "TagModel",
        required: false,
        index: true,
      },
    ],

    uploadedByUserId: {
      type: String,
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

PhotoSpotSchema.pre("save", function () {
  this.normalizedTitle = normalizeText(this.title);
  this.normalizedDescription = normalizeText(this.description);
  this.normalizedCity = normalizeText(this.city);
  this.normalizedCounty = normalizeText(this.county);
  this.normalizedCountry = normalizeText(this.country);
});

PhotoSpotSchema.index({
  title: "text",
  description: "text",
  city: "text",
  county: "text",
  country: "text",
  tags: "text",
});

export const PhotoSpotModel: Model<IPhotoSpot> = mongoose.model<IPhotoSpot>(
  "PhotoSpotModel",
  PhotoSpotSchema,
  "photo_spots",
);

export default PhotoSpotModel;
