import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    postCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, maxlength: 200 },
        color: { type: String, default: "#6366f1" }, // Default indigo color
        icon: { type: String }, // Icon name or URL
        postCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });

export const CategoryModel = model<ICategory>("Category", categorySchema);

export default CategoryModel;
