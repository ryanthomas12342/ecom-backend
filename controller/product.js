const Product = require("../models/product");
const CustomError = require("../utils/customError");
const bigPromise = require("../middleware/bigPromise");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary");
const { pseudoRandomBytes } = require("crypto");
const whereClause = require("../utils/whereClause");

exports.showAllProducts = bigPromise(async (req, res, next) => {
  const resultperpage = 6;

  console.log(req.query);
  const productsObj = new whereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filterProdNumber = products.length;

  productsObj.pager(resultperpage);

  products = await productsObj.base.clone();
  console.log(products);
  res.json({
    products,
  });
});

exports.addProduct = bigPromise(async (req, res, next) => {
  const { name, price, description, brand, category, rating } = req.params;
  let imgArr = [];

  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }

  let result;

  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      result = await cloudinary.v2.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "products",
        }
      );
      imgArr.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imgArr;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(200).json({
    sucess: true,
    product,
  });
});

exports.findProduct = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new CustomError("there is no such product", 400));
  }

  res.status(200).send({
    sucess: true,
    product,
  });
});

exports.adminUpdateProduct = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const imgArr = [];
  let result;

  const product = await Product.findById(id);

  if (!product) {
    return next(new CustomError("there is no such product", 400));
  }

  if (req.files) {
    for (let i = 0; i < product.photos.length; i++) {
      result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }
    let res1;
    for (let i = 0; i < req.files.photos.length; i++) {
      res1 = await cloudinary.v2.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "products",
        }
      );
      imgArr.push({
        id: res1.public_id,
        secure_url: res1.secure_url,
      });
    }
    req.body.photos = imgArr;
  }

  const newProd = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    newProd,
  });
});
exports.adminDeleteProduct = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  let result;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new CustomError("there is no such product", 400));
  }

  if (product.photos) {
    for (let i = 0; i < product.photos.length; i++) {
      result = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }
  }

  res.status(200).json({
    sucess: true,
    product,
  });
});
exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new CustomError("the product is not founf", 402));
  }

  const AldreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (AldreadyReview) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.comment = review.comment), (rev.rating = review.rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.noOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.send({
    product,
  });
});
exports.deleteReview = bigPromise(async (req, res, next) => {
  const { prodId } = req.params;

  const product = await Product.findById(prodId);

  if (!product) {
    return next(new CustomError("the prodcut is not found", 400));
  }

  const hasReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (hasReview) {
    product.reviews = product.reviews.filter(
      (rev) => rev.user.toString() !== req.user._id.toString()
    );

    product.noOfReviews = product.reviews.length;

    if (product.noOfReviews === 0) {
      product.ratings = 0;
    } else {
      product.ratings =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.noOfReviews;
    }
    await product.save({ validateBeforeSave: false });

    res.json({
      sucess: true,
      product,
    });
  } else {
  }
});

exports.getRevForOneProd = bigPromise(async (req, res, next) => {
  const { id } = req.query;

  const prod = await Product.findById(id);

  res.send({
    sucess: true,
    product,
  });
});
