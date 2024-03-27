import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Comment', CommentSchema);
