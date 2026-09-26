const express = require("express");
const cors = require("cors");
const GlobalError = require("./middlewares/globalError");
const routes = require("./routes/index");
const AppError = require("./utils/appError");

const path = require("path")

const app = express();

// Middlewares
app.use(express.json());

app.use(cors());

app.use("/api/v1", routes);


app.use(express.static(path.join(process.cwd(), "uploads")));

// Not Found Route
app.use((req, res, next) => {
  next(new AppError(`Can\'t find this route: ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(GlobalError);

module.exports = app;
