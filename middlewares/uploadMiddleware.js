const multer = require("multer");
const path = require("path");
const fs = require("fs");

const AppError = require("../utils/appError");

const createImageUpload = (folder) => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);

  fs.mkdirSync(uploadDir, {
    recursive: true,
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);

      const fileName = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extension}`;

      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("INVALID_IMAGE_TYPE", 400), false);
    }
  };

  const upload = multer({
    storage,

    fileFilter,

    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  return upload;
};
exports.uploadSingleImage = (folder, fieldName = "image") => {
  return createImageUpload(folder).single(fieldName);
};
exports.uploadMultipleImages = (folder, fieldName = "images", maxCount = 5) => {
  return createImageUpload(folder).array(fieldName, maxCount);
};
