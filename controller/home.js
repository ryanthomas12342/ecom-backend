const bigPromise = require("../middleware/bigPromise");

module.exports.home = (req, res) => {
  res.status(200).json({
    sucess: true,
    greeting: "Hello from api",
  });
};
