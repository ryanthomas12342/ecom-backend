const CustomError = require("../utils/customError");
const bigPromise = require("../middleware/bigPromise");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary");
const Product = require("../models/product");
const Order = require("../models/order");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    paymentInfo,
    orderItems,
    totalAmount,
    taxAmount,
    shippingAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});
exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("order is not present", 400));
  }

  res.send({
    sucess: true,
    order,
  });
});
exports.getLoggedInOrder = bigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("order is not present", 400));
  }

  res.send({
    sucess: true,
    order,
  });
});
exports.getAdminAllOrder = bigPromise(async (req, res, next) => {
  const order = await Order.find({});

  if (!order) {
    return next(new CustomError("order is not present", 400));
  }

  res.send({
    sucess: true,
    order,
  });
});
exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (req.body.orderstatus === "Delivered") {
    return next(new CustomError("order is aldready makred for delivery", 401));
  }

  order.orderStatus = req.body.orderstatus;

  await order.save();

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  res.send({
    sucess: true,
    order,
  });
});

exports.deleteOrder = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const res1 = await Order.findByIdAndDelete(id);

  if (!res1) {
    return next(new CustomError("Could not find order", 400));
  }

  res.send({
    sucess: true,
    res1,
  });
});
async function updateProductStock(prodId, quantity) {
  const product = await Product.findById(prodId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
