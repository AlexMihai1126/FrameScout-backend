import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    displayName: {
      type: String,
      maxlength: 80,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TagModel: Model<ITag> = mongoose.model<ITag>(
  "TagModel",
  TagSchema,
  "tags"
);

export default TagModel;
