const express = require("express");
const GlobalError = require("./middlewares/globalError");
const routes = require("./routes/index");
const AppError = require("./utils/appError");
const helmet = require("helmet");
const { appLimiter } = require("./middlewares/rateLimiterMiddleware");
const { preventNoSqlInjection, preventParameterPollution } = require("./middlewares/sanitizeMiddleware");

const path = require("path");

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use("/api/v1", appLimiter);



// Middlewares
app.use(express.json({ limit: "50kb" }));
app.use(preventNoSqlInjection);
app.use(preventParameterPollution);


app.use("/api/v1", routes);

app.use(express.static(path.join(process.cwd(), "uploads")));

// Not Found Route
app.use((req, res, next) => {
  next(new AppError(`Can\'t find this route: ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(GlobalError);

module.exports = app;
