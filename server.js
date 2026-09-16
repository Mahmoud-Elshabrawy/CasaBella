const dotenv = require("dotenv").config({ path: "config/.env" });
const { dbConnection } = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3000;
dbConnection();

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
