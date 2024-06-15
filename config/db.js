const mongoose = require("mongoose");

const dbConnect = () => {
  const main = async () => {
    await mongoose.connect(process.env.MONGO_URL);
  };

  main()
    .then(() => console.log("connection established"))
    .catch((err) => console.log(err));
};

module.exports = dbConnect;
