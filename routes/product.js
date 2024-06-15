const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  customRole,
} = require("../middleware/isAuthenticated");
const {
  showAllProducts,
  addProduct,
  findProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  addReview,
  deleteReview,
} = require("../controller/product");
router.get("/prod", (req, res) => {
  res.send("hello");
});

router.route("/products").get(showAllProducts);
router
  .route("/admin/product/add")
  .post(isAuthenticated, customRole("admin"), addProduct);

router.route("/products/:id").get(findProduct);

router
  .route("/admin/products/:id")
  .put(isAuthenticated, customRole("admin"), adminUpdateProduct)
  .delete(isAuthenticated, customRole("admin"), adminDeleteProduct);

router.route("/review").post(isAuthenticated, addReview);

router.route("/review/:prodId").delete(isAuthenticated, deleteReview);
module.exports = router;
