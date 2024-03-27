import mongoose from 'mongoose';

// для категории продуктов
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model('Category', CategorySchema);
