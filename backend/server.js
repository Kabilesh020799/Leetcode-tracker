const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const submissionRoutes = require("./routes/submissionRoute");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", submissionRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
