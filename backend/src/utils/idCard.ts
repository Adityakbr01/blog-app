import { createCanvas, loadImage } from "canvas";

interface UserCardData {
    name: string;
    rollNo: string | null;
    department: string | null;
    joinYear: number | null;
    graduationYear: number | null;
    status: string;
}

/**
 * Generate a Student ID Card as PNG buffer
 * @param user - User data for the card
 * @param qrBuffer - QR code image buffer
 * @returns Promise<Buffer> - PNG image buffer of the ID card
 */
export const generateUserCard = async (
    user: UserCardData,
    qrBuffer: Buffer,
): Promise<Buffer> => {
    // Card dimensions
    const width = 600;
    const height = 350;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient (light blue to white)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#E8F4FD");
    gradient.addColorStop(1, "#FFFFFF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Header bar
    ctx.fillStyle = "#2563EB";
    ctx.fillRect(10, 10, width - 20, 60);

    // Header text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("LIBRARY MANAGEMENT SYSTEM", width / 2, 50);

    // Subtitle
    ctx.fillStyle = "#1E40AF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("STUDENT ID CARD", width / 2, 95);

    // Left side - User info
    const leftMargin = 30;
    let yPos = 140;
    const lineHeight = 35;

    ctx.textAlign = "left";
    ctx.fillStyle = "#374151";

    // Name
    ctx.font = "bold 14px Arial";
    ctx.fillText("Name:", leftMargin, yPos);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#111827";
    ctx.fillText(user.name || "N/A", leftMargin + 80, yPos);
    yPos += lineHeight;

    // Roll Number
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Roll No:", leftMargin, yPos);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#111827";
    ctx.fillText(user.rollNo || "N/A", leftMargin + 80, yPos);
    yPos += lineHeight;

    // Department
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Dept:", leftMargin, yPos);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#111827";
    ctx.fillText(user.department || "N/A", leftMargin + 80, yPos);
    yPos += lineHeight;

    // Session (Join Year - Graduation Year)
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Session:", leftMargin, yPos);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#111827";
    const session =
        user.joinYear && user.graduationYear
            ? `${user.joinYear} - ${user.graduationYear}`
            : "N/A";
    ctx.fillText(session, leftMargin + 80, yPos);
    yPos += lineHeight;

    // Status badge
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Status:", leftMargin, yPos);

    // Status badge background
    const statusX = leftMargin + 80;
    const statusY = yPos - 14;
    ctx.fillStyle = user.status === "ACTIVE" ? "#10B981" : "#EF4444";
    ctx.beginPath();
    ctx.roundRect(statusX - 5, statusY - 4, 70, 22, 5);
    ctx.fill();

    // Status text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px Arial";
    ctx.fillText(user.status, statusX + 5, yPos);

    // Right side - QR Code
    const qrSize = 150;
    const qrX = width - qrSize - 40;
    const qrY = 120;

    // QR code border/background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    // Load and draw QR code
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // QR label
    ctx.fillStyle = "#6B7280";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Scan for verification", qrX + qrSize / 2, qrY + qrSize + 25);

    // Footer
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        `Generated on ${new Date().toLocaleDateString("en-IN")}`,
        width / 2,
        height - 20,
    );

    // Return as PNG buffer
    return canvas.toBuffer("image/png");
};
