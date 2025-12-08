import { Schema, model, Document } from "mongoose";
import { Role, UserStatus } from "@/constants/user.constants.js";
import bcrypt from "bcrypt";

export interface OtpInfo {
    codeHash: string;
    expiresAt: Date;
    lastSentAt?: Date;
}

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
    avatarPublicId?: string;
    role: Role;
    status: UserStatus;
    otp?: OtpInfo | null;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
    // Instance methods
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const otpSchema = new Schema<OtpInfo>(
    {
        codeHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        lastSentAt: { type: Date },
    },
    { _id: false },
);

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, unique: true, lowercase: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        bio: { type: String, maxlength: 500, default: "" },
        avatar: { type: String },
        avatarPublicId: { type: String },
        role: { type: String, enum: Object.values(Role), default: Role.USER },
        status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING },
        otp: { type: otpSchema, required: false },
        refreshTokens: [{ type: String }],
    },
    {
        timestamps: true,
    },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// Auto-generate username from email if not provided & auto-hash password
userSchema.pre("save", async function () {
    // Normalize email
    this.email = this.email.toLowerCase().trim();

    // Auto-generate username from email if not set
    if (!this.username) {
        const baseUsername = this.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        let username = baseUsername;
        let counter = 1;

        // Check for uniqueness and add suffix if needed
        while (await UserModel.exists({ username, _id: { $ne: this._id } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        this.username = username;
    } else {
        this.username = this.username.toLowerCase().trim();
    }

    // Auto-hash password if modified
    if (this.isModified("password")) {
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUser>("User", userSchema);

export default UserModel;