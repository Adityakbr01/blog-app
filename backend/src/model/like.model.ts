import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    post: Types.ObjectId;
    createdAt: Date;
}

const likeSchema = new Schema<ILike>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound unique index to prevent duplicate likes
likeSchema.index({ user: 1, post: 1 }, { unique: true });
likeSchema.index({ post: 1 });

export const LikeModel = model<ILike>("Like", likeSchema);

export default LikeModel;
