import logger from "@/utils/logger.js";
import { Resend } from "resend";

// const resend = new Resend('re_PKMTBRBR_5GVdbySqBCG9nTrKhTFHfZF8');
const resend = new Resend('re_L613J5Zr_Dpp51LQYTcw5hrdkHoFcZ6HW');

export const sendMail = async ({
    to,
    subject,
    html,
}: {
    to: string | string[];
    subject: string;
    html: string;
}): Promise<boolean> => {
    try {
        const { data, error } = await resend.emails.send({
            // YE ADDRESS 100% ALLOWED HAI FREE ACCOUNT PAR BHI → sabko email jayega
            from: "Aditya Blog App <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            logger.error("Resend API Error:", error);
            return false;
        }

        logger.info(`Email sent → ${to} | ID: ${data?.id}`);
        return true;
    } catch (err: any) {
        logger.error("Email failed:", err.message ?? err);
        return false;
    }
};

export default resend;