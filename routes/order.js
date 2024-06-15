const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  customRole,
} = require("../middleware/isAuthenticated");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrder,
  getAdminAllOrder,
  deleteOrder,
} = require("../controller/order");

router.route("/order/create").post(isAuthenticated, createOrder);

router
  .route("/order/:id")
  .get(isAuthenticated, getOneOrder)
  .delete(isAuthenticated, customRole("admin"), deleteOrder);

router
  .route("/admin/order")
  .get(isAuthenticated, customRole("admin"), getAdminAllOrder);

module.exports = router;
