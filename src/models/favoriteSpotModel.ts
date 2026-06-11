import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFavoriteSpot extends Document {
  _id: Types.ObjectId;

  userId: string;
  photoSpotId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSpotSchema = new Schema<IFavoriteSpot>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    photoSpotId: {
      type: Schema.Types.ObjectId,
      ref: "PhotoSpotModel",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteSpotSchema.index(
  { userId: 1, photoSpotId: 1 },
  { unique: true }
);

export const FavoriteSpotModel: Model<IFavoriteSpot> =
  mongoose.model<IFavoriteSpot>(
    "FavoriteSpotModel",
    FavoriteSpotSchema,
    "favorite_spots"
  );

export default FavoriteSpotModel;