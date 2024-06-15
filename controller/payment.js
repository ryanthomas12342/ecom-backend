const bigPromise = require("../middleware/bigPromise");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.sendStripKey = (req, res, next) => {
  res.json({
    stripekey: process.env.STRIPE_KEY,
  });
};
exports.sendRazorpayKey = (req, res, next) => {
  res.json({
    stripekey: process.env.RAZORPAY_KEY,
  });
};
exports.captureStripePayment = bigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    sucess: true,
    client_secret: paymentIntent.client_secret,
  });
});
exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const result = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
  });

  res.send({
    sucess: true,
  });
});
