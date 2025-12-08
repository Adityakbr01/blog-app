import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    category?: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    content: string;
    image?: string;
    imagePublicId?: string;
    tags: string[];
    isPublished: boolean;
    likes: Types.ObjectId[];
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, required: true, maxlength: 500 },
        content: { type: String, required: true },
        image: { type: String },
        imagePublicId: { type: String },
        tags: [{ type: String, lowercase: true, trim: true }],
        isPublished: { type: Boolean, default: false, index: true },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for performance
postSchema.index({ isPublished: 1, createdAt: -1 });
postSchema.index({ author: 1, isPublished: 1 });
postSchema.index({ category: 1, isPublished: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ slug: 1 }, { unique: true });

export const PostModel = model<IPost>("Post", postSchema);

export default PostModel;
