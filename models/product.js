const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "please procvide a product name"],
    trim: true,
    max: [120, "product should not be more than 120 characcters"],
  },
  price: {
    type: Number,
    required: [true, "please provide a product price"],
  },
  description: {
    type: String,
    required: [true, "please provide a  desc"],
  },
  brand: {
    type: String,
    required: [true, "please provide a  brand"],
  },
  photos: [
    {
      id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "please select categories from short-sleeves long-sleeves sweat-shirts hoodeis",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "please select cat only from short-sleeves long-sleeves sweat-shirts hoodies",
    },
  },
  ratings: {
    type: Number,
    default: 0,
  },
  noOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
