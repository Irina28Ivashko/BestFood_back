import mongoose from 'mongoose';

//модель продуктов питания
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    calories: { type: Number, required: true },
    proteins: { type: Number, required: true },
    fats: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;
