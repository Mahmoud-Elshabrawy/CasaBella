const mongoose = require("mongoose");
exports.dbConnection = () => {
  mongoose
    .connect(process.env.DATABASE)
    .then(() => {
      console.log("Database Connected!");
    })
    .catch((err) => {
      console.log(err.message);
    });
};
