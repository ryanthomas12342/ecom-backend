const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  customRole,
} = require("../middleware/isAuthenticated");

const {
  sendStripKey,
  sendRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controller/payment");

router.route("/stripekey").get(isAuthenticated, sendStripKey);
router.route("/razorpaykey").get(isAuthenticated, sendRazorpayKey);

router.route("/stripepayment").post(isAuthenticated, captureStripePayment);
router.route("/razorpaypayment").post(isAuthenticated, captureRazorpayPayment);

module.exports = router;
