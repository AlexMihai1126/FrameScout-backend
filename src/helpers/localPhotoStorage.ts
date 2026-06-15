import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import sanitizeFilename from "sanitize-filename";
import generatePhotoSpotFilenames from "./generatePhotoSpotFilenames.js";

const PHOTO_SPOTS_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "photo-spots"
);

export interface LocalPhotoStorageResult {
  originalImgName: string;
  previewImgName: string;
  highResPreviewImgName: string;

  originalName: string;
  mimeType: string;

  originalWidth?: number;
  originalHeight?: number;
}

export async function savePhotoSpotImagesLocally(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<LocalPhotoStorageResult> {
  await fs.mkdir(PHOTO_SPOTS_UPLOAD_DIR, { recursive: true });

  const safeOriginalName = sanitizeFilename(originalFilename) || "photo";

  const {
    originalImgName,
    previewImgName,
    highResPreviewImgName,
  } = generatePhotoSpotFilenames(originalFilename);

  const originalPath = path.join(PHOTO_SPOTS_UPLOAD_DIR, originalImgName);
  const previewPath = path.join(PHOTO_SPOTS_UPLOAD_DIR, previewImgName);
  const highResPreviewPath = path.join(
    PHOTO_SPOTS_UPLOAD_DIR,
    highResPreviewImgName
  );

  const metadata = await sharp(fileBuffer, { failOn: "none" }).metadata();

  await fs.writeFile(originalPath, fileBuffer);

  await sharp(fileBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: 480,
      withoutEnlargement: true,
    })
    .webp({
      quality: 75,
    })
    .toFile(previewPath);

  await sharp(fileBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({
      quality: 85,
    })
    .toFile(highResPreviewPath);

  return {
    originalImgName,
    previewImgName,
    highResPreviewImgName,

    originalName: safeOriginalName,
    mimeType,

    originalWidth: metadata.width,
    originalHeight: metadata.height,
  };
}

export async function deletePhotoSpotImagesLocally(imageNames: {
  originalImgName?: string;
  previewImgName?: string;
  highResPreviewImgName?: string;
}) {
  const filenames = [
    imageNames.originalImgName,
    imageNames.previewImgName,
    imageNames.highResPreviewImgName,
  ].filter(Boolean) as string[];

  await Promise.allSettled(
    filenames.map((filename) =>
      fs.unlink(path.join(PHOTO_SPOTS_UPLOAD_DIR, filename))
    )
  );
}