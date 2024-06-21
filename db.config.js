const mongoose = require("mongoose");

const dbConnection = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connection successful"))
    .catch((error) => {
      console.log("MongoDB connection failed", error);
    });
};

module.exports = dbConnection;
