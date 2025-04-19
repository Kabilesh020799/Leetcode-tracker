const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const submissionRoutes = require("./routes/submissionRoute");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", submissionRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
