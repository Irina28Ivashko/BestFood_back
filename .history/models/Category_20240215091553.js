import mongoose from 'mongoose';

// для категории продуктов
const СategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

// const CategoryModel = mongoose.model('Category', categorySchema);

// export default CategoryModel;

export default mongoose.model('Category', СategorySchema);
