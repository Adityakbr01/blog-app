import cloudinary from "@/config/cloudinary.js";

interface UploadResult {
    url: string;
    publicId: string;
    secureUrl: string;
}

interface CloudinaryUploadResult {
    url: string;
    public_id: string;
    secure_url: string;
}

/**
 * Upload a buffer to Cloudinary
 * @param buffer - Image buffer to upload
 * @param folder - Cloudinary folder path
 * @param fileName - Optional custom file name (without extension)
 * @returns Promise<UploadResult> - Upload result with URLs
 */
export const uploadToCloudinary = async (
    buffer: Buffer,
    folder: string,
    fileName?: string,
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadOptions: {
            folder: string;
            resource_type: "image";
            public_id?: string;
            format: string;
        } = {
            folder,
            resource_type: "image",
            format: "png",
        };

        if (fileName) {
            uploadOptions.public_id = fileName;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result) {
                    reject(new Error("Upload failed: No result returned"));
                    return;
                }

                resolve({
                    url: result.url,
                    publicId: result.public_id,
                    secureUrl: result.secure_url,
                });
            },
        );

        uploadStream.end(buffer);
    });
};/**
 * Delete an image from Cloudinary by public ID
 * @param publicId - The public ID of the image to delete
 * @returns Promise<boolean> - True if deleted successfully
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === "ok";
    } catch {
        return false;
    }
};
