import multer from "multer";
import AppError from "@/utils/AppError.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";

// Allowed image mime types
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// File filter for images only
const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
                HTTP_STATUS.BAD_REQUEST
            )
        );
    }
};

// Memory storage for Cloudinary uploads (stores file in buffer)
const memoryStorage = multer.memoryStorage();

// ---- Single Image Upload ----
export const uploadSingleImage = (fieldName: string = "image") => {
    return multer({
        storage: memoryStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
    }).single(fieldName);
};

// ---- Multiple Images Upload ----
export const uploadMultipleImages = (fieldName: string = "images", maxCount: number = 10) => {
    return multer({
        storage: memoryStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: maxCount,
        },
    }).array(fieldName, maxCount);
};

// ---- Book Images Upload (with cover + gallery) ----
export const uploadBookImages = () => {
    return multer({
        storage: memoryStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: MAX_FILE_SIZE,
            files: 10,
        },
    }).fields([
        { name: "coverImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 9 },
    ]);
};

// ---- Generic Upload Config ----
export const upload = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

export default upload;
