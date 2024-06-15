const app = require("./app");
const dbConnect = require("./config/db");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
require("dotenv").config();

dbConnect();

app.listen(process.env.PORT, (req, res) => {
  console.log(`server is runnign at ${process.env.PORT}`);
});
