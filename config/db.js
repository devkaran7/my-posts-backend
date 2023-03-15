const mongoose = require("mongoose");

const connectWithDb = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_URL)
    .then(console.log("Database got connected"))
    .catch((error) => {
      console.log("Database connection issues");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDb;
