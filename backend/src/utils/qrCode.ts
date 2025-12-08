import QRCode from "qrcode";

/**
 * Generate QR code as a PNG buffer
 * @param qrValue - The string value to encode in the QR code
 * @returns Promise<Buffer> - PNG image buffer
 */
export const generateQrBuffer = async (qrValue: string): Promise<Buffer> => {
    const qrBuffer = await QRCode.toBuffer(qrValue, {
        type: "png",
        width: 200,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
    });

    return qrBuffer;
};

/**
 * Generate QR code as a data URL (base64)
 * @param qrValue - The string value to encode in the QR code
 * @returns Promise<string> - Data URL string
 */
export const generateQrDataUrl = async (qrValue: string): Promise<string> => {
    const dataUrl = await QRCode.toDataURL(qrValue, {
        width: 200,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
    });

    return dataUrl;
};
