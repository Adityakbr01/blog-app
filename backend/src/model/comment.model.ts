import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
    _id: Types.ObjectId;
    post: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
    parent?: Types.ObjectId | null;
    replies: Types.ObjectId[];
    depth: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, maxlength: 2000 },
        parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
        replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
        depth: { type: Number, default: 0, max: 5 },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
commentSchema.index({ post: 1, parent: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

export const CommentModel = model<IComment>("Comment", commentSchema);

export default CommentModel;
