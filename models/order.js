const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: [true, "please add a nunmber in stock"],
    },
    city: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
      product: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
  },

  taxAmount: {
    type: Number,
    required: true,
  },
  shippingAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "processing",
    required: true,
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
