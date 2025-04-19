const express = require("express");
const router = express.Router();
const submissionController = require("../controller/submissionController");

router.post("/submit", submissionController.handleSubmission);

module.exports = router;
