import path from "path";
import crypto from "crypto";

function generatePhotoSpotFilenames(initialFilename: string) {
  const ext = path.extname(initialFilename).toLowerCase() || ".jpg";
  const baseName = crypto.randomUUID();

  return {
    originalImgName: `${baseName}-original${ext}`,
    previewImgName: `${baseName}-preview.webp`,
    highResPreviewImgName: `${baseName}-highres.webp`,
  };
}

export default generatePhotoSpotFilenames;